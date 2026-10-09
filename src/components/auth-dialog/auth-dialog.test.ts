import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  signInWithEmailAndPasswordMock,
  createUserWithEmailAndPasswordMock,
  signInWithPopupMock,
  updateProfileMock,
  navigateMock,
  saveSessionMock,
  setCurrentSessionMock,
  showSnackbarMock,
} = vi.hoisted(() => ({
  signInWithEmailAndPasswordMock: vi.fn(),
  createUserWithEmailAndPasswordMock: vi.fn(),
  signInWithPopupMock: vi.fn(),
  updateProfileMock: vi.fn(),
  navigateMock: vi.fn(),
  saveSessionMock: vi.fn(),
  setCurrentSessionMock: vi.fn(),
  showSnackbarMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  signInWithPopup: signInWithPopupMock,
  updateProfile: updateProfileMock,
  GoogleAuthProvider: vi.fn(),
}));
vi.mock('../../firebase/firebase-config', () => ({ firebaseAuth: {} }));
vi.mock('../../app/router', () => ({ navigate: navigateMock }));
vi.mock('../../app/session', () => ({ saveSession: saveSessionMock }));
vi.mock('../../app/auth-state', () => ({ setCurrentSession: setCurrentSessionMock }));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

import { isAuthMode, openAuthDialog, closeAuthDialog } from './auth-dialog';

// jsdom does not fully support <dialog>, so we give it the two methods the
// auth dialog uses: showModal() opens it, close() closes it and fires "close".
function fakeShowModal(this: HTMLDialogElement): void {
  this.open = true;
}

function fakeClose(this: HTMLDialogElement): void {
  if (!this.open) {
    return;
  }
  this.open = false;
  this.dispatchEvent(new Event('close'));
}

HTMLDialogElement.prototype.showModal = fakeShowModal;
HTMLDialogElement.prototype.close = fakeClose;

const EMAIL = 'student@rs.school';

function getDialog(): HTMLDialogElement {
  return document.querySelector('.auth-dialog') as HTMLDialogElement;
}

function getInput(id: string): HTMLInputElement {
  return document.querySelector(`#${id}`) as HTMLInputElement;
}

function getForm(mode: 'login' | 'register'): HTMLFormElement {
  return document.querySelector(`#auth-panel-${mode} form`) as HTMLFormElement;
}

function getSubmit(mode: 'login' | 'register'): HTMLButtonElement {
  return getForm(mode).querySelector('.auth-dialog__submit') as HTMLButtonElement;
}

function getGoogleButton(): HTMLButtonElement {
  return getForm('login').querySelector('.auth-dialog__google') as HTMLButtonElement;
}

function fillLoginForm(): void {
  getInput('login-email').value = EMAIL;
  getInput('login-password').value = 'secret1';
}

function fillRegisterForm(): void {
  getInput('register-username').value = 'CozyGamer99';
  getInput('register-email').value = EMAIL;
  getInput('register-password').value = 'Secret1!';
  getInput('register-confirm-password').value = 'Secret1!';
}

describe('isAuthMode', () => {
  it('accepts "login" and "register"', () => {
    expect(isAuthMode('login')).toBe(true);
    expect(isAuthMode('register')).toBe(true);
  });

  it('rejects anything else, including missing values', () => {
    expect(isAuthMode('guest')).toBe(false);
    expect(isAuthMode('')).toBe(false);
    expect(isAuthMode(undefined)).toBe(false);
    expect(isAuthMode(undefined)).toBe(false);
  });
});

describe('auth dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.replaceChildren();
    history.replaceState({}, '', '/');
  });

  describe('opening, closing and switching', () => {
    it('opens in the requested mode and reuses the same dialog', () => {
      openAuthDialog('register');

      expect(getDialog().open).toBe(true);
      expect(getDialog().dataset.mode).toBe('register');
      expect(document.querySelector('#auth-tab-register')?.getAttribute('aria-selected')).toBe(
        'true'
      );

      openAuthDialog('login');

      expect(document.querySelectorAll('.auth-dialog')).toHaveLength(1);
      expect(getDialog().dataset.mode).toBe('login');
    });

    it('switches mode from a link and updates the URL', () => {
      openAuthDialog('login');

      document.querySelector<HTMLButtonElement>('.auth-dialog__link[data-switch-to]')?.click();

      expect(getDialog().dataset.mode).toBe('register');
      expect(navigateMock).toHaveBeenCalledWith('/?auth=register', { replace: true });
    });

    it('removes the auth parameter from the URL when it closes', () => {
      openAuthDialog('login');

      closeAuthDialog();

      expect(getDialog().open).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('closes when the backdrop is clicked', () => {
      openAuthDialog('login');

      getDialog().click();

      expect(getDialog().open).toBe(false);
    });

    it('shows and hides the password with the eye button', () => {
      openAuthDialog('login');
      const toggle = document.querySelector<HTMLButtonElement>('[data-password-toggle]');
      const password = getInput('login-password');

      toggle?.click();

      expect(password.type).toBe('text');
      expect(toggle?.getAttribute('aria-label')).toBe('Hide password');

      toggle?.click();

      expect(password.type).toBe('password');
      expect(toggle?.getAttribute('aria-label')).toBe('Show password');
    });
  });

  describe('login', () => {
    it('does not call Firebase when the form is invalid', () => {
      openAuthDialog('login');

      getForm('login').requestSubmit();

      expect(signInWithEmailAndPasswordMock).not.toHaveBeenCalled();
    });

    it('signs in, saves the session, closes the dialog and greets the user', async () => {
      signInWithEmailAndPasswordMock.mockResolvedValue({
        user: { displayName: 'ForestDweller', email: EMAIL, photoURL: undefined },
      });
      openAuthDialog('login');
      fillLoginForm();

      getForm('login').requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith('Welcome, ForestDweller!', 'success')
      );
      expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith({}, EMAIL, 'secret1');
      expect(saveSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'ForestDweller', email: EMAIL })
      );
      expect(setCurrentSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'ForestDweller', email: EMAIL })
      );
      expect(getDialog().open).toBe(false);
    });

    it('shows a friendly message and keeps the dialog open when sign-in fails', async () => {
      signInWithEmailAndPasswordMock.mockRejectedValue({ code: 'auth/invalid-credential' });
      openAuthDialog('login');
      fillLoginForm();

      getForm('login').requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith('Incorrect email or password.', 'error')
      );
      expect(saveSessionMock).not.toHaveBeenCalled();
      expect(getDialog().open).toBe(true);
      expect(getSubmit('login').textContent).toBe('Login');
      expect(getSubmit('login').disabled).toBe(false);
    });

    it('shows the default message for an unknown error', async () => {
      signInWithEmailAndPasswordMock.mockRejectedValue(new Error('boom'));
      openAuthDialog('login');
      fillLoginForm();

      getForm('login').requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Something went wrong. Please try again.',
          'error'
        )
      );
    });

    it('locks the dialog while the request is pending', () => {
      signInWithEmailAndPasswordMock.mockReturnValue(new Promise(() => {}));
      openAuthDialog('login');
      fillLoginForm();

      getForm('login').requestSubmit();

      expect(getSubmit('login').textContent).toBe('Logging in…');
      expect(getSubmit('login').disabled).toBe(true);
      expect(getInput('login-email').disabled).toBe(true);

      getDialog().click();
      closeAuthDialog();
      expect(getDialog().open).toBe(true);

      const cancelEvent = new Event('cancel', { cancelable: true });
      getDialog().dispatchEvent(cancelEvent);
      expect(cancelEvent.defaultPrevented).toBe(true);

      getForm('login').requestSubmit();
      expect(signInWithEmailAndPasswordMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('does not call Firebase when the form is invalid', () => {
      openAuthDialog('register');

      getForm('register').requestSubmit();

      expect(createUserWithEmailAndPasswordMock).not.toHaveBeenCalled();
    });

    it('creates the account, saves the username and greets the user', async () => {
      const user = { displayName: undefined, email: EMAIL, photoURL: undefined };
      createUserWithEmailAndPasswordMock.mockResolvedValue({ user });
      updateProfileMock.mockResolvedValue(undefined);
      openAuthDialog('register');
      fillRegisterForm();

      getForm('register').requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith('Welcome, CozyGamer99!', 'success')
      );
      expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith({}, EMAIL, 'Secret1!');
      expect(updateProfileMock).toHaveBeenCalledWith(user, { displayName: 'CozyGamer99' });
      expect(saveSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'CozyGamer99', email: EMAIL })
      );
      expect(getDialog().open).toBe(false);
    });

    it('shows a friendly message when the email is already used', async () => {
      createUserWithEmailAndPasswordMock.mockRejectedValue({ code: 'auth/email-already-in-use' });
      openAuthDialog('register');
      fillRegisterForm();

      getForm('register').requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'An account with this email already exists.',
          'error'
        )
      );
      expect(getDialog().open).toBe(true);
      expect(getSubmit('register').textContent).toBe('Create Account');
    });
  });

  describe('Google sign-in', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('signs in and keeps the Google avatar, using the email when there is no name', async () => {
      signInWithPopupMock.mockResolvedValue({
        user: { displayName: undefined, email: EMAIL, photoURL: 'https://example.com/avatar.png' },
      });
      openAuthDialog('login');

      getGoogleButton().click();

      await vi.waitFor(() => expect(saveSessionMock).toHaveBeenCalled());
      expect(saveSessionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: EMAIL,
          avatarUrl: 'https://example.com/avatar.png',
        })
      );
      expect(getDialog().open).toBe(false);
    });

    it('stays quiet when the user closes the Google popup', async () => {
      signInWithPopupMock.mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      openAuthDialog('login');

      getGoogleButton().click();

      await vi.waitFor(() => expect(getGoogleButton().disabled).toBe(false));
      expect(showSnackbarMock).not.toHaveBeenCalled();
      expect(getDialog().open).toBe(true);
    });

    it('shows an error when Google sign-in fails', async () => {
      signInWithPopupMock.mockRejectedValue({ code: 'auth/popup-blocked' });
      openAuthDialog('login');

      getGoogleButton().click();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Your browser blocked the sign-in popup. Please allow popups and try again.',
          'error'
        )
      );
    });

    it('gives up with a timeout message when Google takes too long', async () => {
      vi.useFakeTimers();
      signInWithPopupMock.mockReturnValue(new Promise(() => {}));
      openAuthDialog('login');

      getGoogleButton().click();
      await vi.advanceTimersByTimeAsync(90 * 1000);

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Sign-in is taking too long. Please try again.',
          'error'
        )
      );
    });
  });
});
