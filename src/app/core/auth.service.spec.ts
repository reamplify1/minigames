import { TestBed } from '@angular/core/testing';
import {
  createFakeFirebase,
  provideTestApp,
  storeSession,
  type FakeFirebase,
} from '../testing/test-helpers';
import { AuthService } from './auth.service';
import { readStoredSession } from './session';
import { SnackbarService } from './snackbar.service';

const SIX_MINUTES_MS: number = 6 * 60 * 1000;

describe('AuthService', () => {
  let firebase: FakeFirebase;

  function createService(): AuthService {
    TestBed.configureTestingModule({ providers: provideTestApp(firebase) });
    return TestBed.inject(AuthService);
  }

  function snackbarTexts(): string[] {
    return TestBed.inject(SnackbarService)
      .messages()
      .map((message) => message.text);
  }

  beforeEach(() => {
    localStorage.clear();
    firebase = createFakeFirebase();
  });

  it('starts as a guest when nothing is stored', () => {
    expect(createService().session()).toBeUndefined();
  });

  it('restores a valid stored session', () => {
    storeSession();
    expect(createService().session()?.displayName).toBe('Forest Dweller');
  });

  it('clears an expired session and tells the user', () => {
    storeSession({ authenticatedAt: Date.now() - SIX_MINUTES_MS });

    const service = createService();

    expect(service.session()).toBeUndefined();
    expect(readStoredSession().status).toBe('none');
    expect(firebase.logout).toHaveBeenCalled();
    expect(snackbarTexts()).toEqual(['Your session has expired. Please log in again.']);
  });

  it('notices when the session expires while the app is open', () => {
    storeSession();
    const service = createService();

    storeSession({ authenticatedAt: Date.now() - SIX_MINUTES_MS });
    service.checkSessionExpiration();

    expect(service.session()).toBeUndefined();
  });

  it('clears a broken session without showing a message', () => {
    localStorage.setItem('minigames:minigames-rss:app-session', 'not-json');

    const service = createService();

    expect(service.session()).toBeUndefined();
    expect(snackbarTexts()).toEqual([]);
  });

  it('saves the session after a login', async () => {
    const service = createService();

    await service.login('forest@test.dev', 'secret');

    expect(firebase.login).toHaveBeenCalledWith('forest@test.dev', 'secret');
    expect(service.session()?.email).toBe('forest@test.dev');
    expect(readStoredSession().status).toBe('valid');
    expect(snackbarTexts()).toEqual(['Welcome, Forest!']);
  });

  it('uses the chosen username after a registration', async () => {
    const service = createService();

    await service.register('forest@test.dev', 'secret', 'NewName');

    expect(service.session()?.displayName).toBe('NewName');
  });

  it('keeps the avatar from a Google login', async () => {
    const service = createService();

    await service.loginWithGoogle();

    expect(service.profile()).toEqual({
      name: 'Forest',
      initials: 'F',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('clears the session on logout', async () => {
    storeSession();
    const service = createService();

    await service.logout();

    expect(service.session()).toBeUndefined();
    expect(readStoredSession().status).toBe('none');
    expect(snackbarTexts()).toEqual(["You've been logged out."]);
  });

  it('switches to guest mode even when Firebase sign-out fails', async () => {
    storeSession();
    const service = createService();
    firebase.logout.mockRejectedValueOnce(new Error('offline'));

    await service.logout();

    expect(service.session()).toBeUndefined();
    expect(snackbarTexts()).toEqual(['Sign-out failed, but you have been switched to Guest Mode.']);
  });
});
