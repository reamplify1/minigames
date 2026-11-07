import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseOptions } from './firebase-env.generated';

const GOOGLE_SIGN_IN_TIMEOUT_MS: number = 90 * 1000;

function rejectAfter(ms: number): Promise<never> {
  return new Promise<never>(
    (_resolve: (value: never) => void, reject: (reason: Error) => void): void => {
      setTimeout((): void => {
        reject(
          Object.assign(new Error('Google sign-in timed out.'), { code: 'auth/popup-timeout' })
        );
      }, ms);
    }
  );
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private firebaseAuth: Auth | undefined;

  private get auth(): Auth {
    this.firebaseAuth ??= getAuth(initializeApp(firebaseOptions));
    return this.firebaseAuth;
  }

  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(credential.user, { displayName });
    return credential.user;
  }

  async loginWithGoogle(): Promise<User> {
    const credential = await Promise.race([
      signInWithPopup(this.auth, new GoogleAuthProvider()),
      rejectAfter(GOOGLE_SIGN_IN_TIMEOUT_MS),
    ]);

    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
