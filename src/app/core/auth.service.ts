import { computed, inject, Injectable, signal } from '@angular/core';
import type { User } from 'firebase/auth';
import { FirebaseAuthService } from './firebase-auth.service';
import { getProfileInitials, resolveProfileName } from './profile-display';
import { clearSession, readStoredSession, saveSession, type AppSession } from './session';
import { SnackbarService } from './snackbar.service';

const SESSION_EXPIRED_MESSAGE: string = 'Your session has expired. Please log in again.';
const LOGOUT_SUCCESS_MESSAGE: string = "You've been logged out.";
const LOGOUT_ERROR_MESSAGE: string = 'Sign-out failed, but you have been switched to Guest Mode.';

export interface UserProfile {
  name: string;
  initials: string;
  avatarUrl: string | undefined;
}

function buildSession(user: User, displayNameOverride?: string): AppSession {
  return {
    displayName: displayNameOverride ?? user.displayName ?? user.email ?? 'Player',
    email: user.email ?? '',
    authenticatedAt: Date.now(),
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase: FirebaseAuthService = inject(FirebaseAuthService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  readonly session = signal<AppSession | undefined>(undefined);

  readonly profile = computed<UserProfile | undefined>((): UserProfile | undefined => {
    const session = this.session();

    if (!session) {
      return undefined;
    }

    const name: string = resolveProfileName(session);
    return { name, initials: getProfileInitials(name), avatarUrl: session.avatarUrl };
  });

  constructor() {
    this.checkSessionExpiration();
  }

  checkSessionExpiration(): void {
    const stored = readStoredSession();

    if (stored.status === 'valid') {
      if (stored.session && !this.session()) {
        this.session.set(stored.session);
      }
      return;
    }

    if (!this.session() && stored.status === 'none') {
      return;
    }

    clearSession();
    this.firebase.logout().catch((): void => {});
    this.session.set(undefined);

    if (stored.status === 'expired') {
      this.snackbar.show(SESSION_EXPIRED_MESSAGE, 'error');
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.completeLogin(await this.firebase.login(email, password));
  }

  async register(email: string, password: string, username: string): Promise<void> {
    this.completeLogin(await this.firebase.register(email, password, username), username);
  }

  async loginWithGoogle(): Promise<void> {
    this.completeLogin(await this.firebase.loginWithGoogle());
  }

  async logout(): Promise<void> {
    let didSignOutFail = false;

    try {
      await this.firebase.logout();
    } catch {
      didSignOutFail = true;
    }

    clearSession();
    this.session.set(undefined);

    if (didSignOutFail) {
      this.snackbar.show(LOGOUT_ERROR_MESSAGE, 'error');
    } else {
      this.snackbar.show(LOGOUT_SUCCESS_MESSAGE, 'success');
    }
  }

  private completeLogin(user: User, displayNameOverride?: string): void {
    const session = buildSession(user, displayNameOverride);

    saveSession(session);
    this.session.set(session);
    this.snackbar.show(`Welcome, ${session.displayName}!`, 'success');
  }
}
