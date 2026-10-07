import './auth-dialog.scss';
import mailIcon from '../../assets/icons/mail-icon.svg';
import lockIcon from '../../assets/icons/lock-icon.svg';
import eyeIcon from '../../assets/icons/eye-icon.svg';
import userIcon from '../../assets/icons/user-icon.svg';
import googleIcon from '../../assets/icons/google-icon.svg';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase/firebase-config';
import { navigate } from '../../app/router';
import { withAuthParameter, withoutAuthParameter } from '../../app/dialog-urls';
import { saveSession, type AppSession } from '../../app/session';
import { setCurrentSession } from '../../app/auth-state';
import { showSnackbar } from '../snackbar/snackbar';
import { createFieldController, setupFormValidation } from './auth-form-validation';
import {
  validateConfirmPassword,
  validateEmail,
  validateLoginPassword,
  validateRegisterPassword,
  validateUsername,
} from './auth-validation';

export type AuthMode = 'login' | 'register';

const DEFAULT_MODE: AuthMode = 'login';
const DIALOG_SELECTOR = '.auth-dialog';
const TAB_SELECTOR = '.auth-dialog__tab';
const SWITCH_SELECTOR = '[data-switch-to]';
const PASSWORD_TOGGLE_SELECTOR = '[data-password-toggle]';
const CONTROL_SELECTOR = '.auth-dialog__control';
const INPUT_SELECTOR = '.auth-dialog__input';
const PASSWORD_MIN_LENGTH = 6;

const LOGIN_SUBMIT_LABEL = 'Login';
const LOGIN_PENDING_LABEL = 'Logging in…';
const REGISTER_SUBMIT_LABEL = 'Create Account';
const REGISTER_PENDING_LABEL = 'Creating account…';

const DEFAULT_AUTH_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

interface FieldOptions {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  icon: string;
  autocomplete: string;
  minLength?: number;
  withToggle?: boolean;
}

export function isAuthMode(value: string | null | undefined): value is AuthMode {
  return value === 'login' || value === 'register';
}

function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

function getAuthErrorMessage(error: unknown): string {
  return hasErrorCode(error)
    ? (AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_AUTH_ERROR_MESSAGE)
    : DEFAULT_AUTH_ERROR_MESSAGE;
}

function createField(options: FieldOptions): string {
  const minLength = options.minLength ? `minlength="${options.minLength}"` : '';
  const textAttributes =
    options.type === 'password' ? '' : 'autocapitalize="none" spellcheck="false"';
  const toggle = options.withToggle
    ? `<button
         class="auth-dialog__toggle"
         type="button"
         aria-label="Show password"
         aria-pressed="false"
         data-password-toggle
       >
         <img class="auth-dialog__toggle-icon" src="${eyeIcon}" alt="" />
       </button>`
    : '';

  const errorId = `${options.id}-error`;

  return `
    <div class="auth-dialog__field">
      <label class="auth-dialog__label" for="${options.id}">${options.label}</label>
      <div class="auth-dialog__control">
        <img class="auth-dialog__control-icon" src="${options.icon}" alt="" />
        <input
          class="auth-dialog__input"
          id="${options.id}"
          name="${options.name}"
          type="${options.type}"
          placeholder="${options.placeholder}"
          autocomplete="${options.autocomplete}"
          ${minLength}
          ${textAttributes}
          aria-describedby="${errorId}"
          aria-invalid="false"
          required
        />
        ${toggle}
      </div>
      <p class="auth-dialog__error" id="${errorId}" aria-live="polite"></p>
    </div>
  `;
}

function createActions(submitLabel: string, googleLabel: string): string {
  return `
    <div class="auth-dialog__actions">
      <button class="auth-dialog__submit" type="submit">${submitLabel}</button>
      <p class="auth-dialog__divider">or</p>
      <button class="auth-dialog__google" type="button">
        <img class="auth-dialog__google-icon" src="${googleIcon}" alt="" />
        ${googleLabel}
      </button>
    </div>
  `;
}

function switchMode(dialog: HTMLDialogElement, mode: AuthMode, onSwitch?: () => void): void {
  if (dialog.dataset.mode === mode) {
    return;
  }

  dialog.dataset.mode = mode;
  onSwitch?.();

  const tabs = dialog.querySelectorAll<HTMLButtonElement>(`:scope ${TAB_SELECTOR}`);

  for (const tab of tabs) {
    tab.setAttribute('aria-selected', String(tab.dataset.switchTo === mode));
  }

  dialog.querySelector<HTMLButtonElement>(`:scope ${TAB_SELECTOR}[aria-selected="true"]`)?.focus();
}

function togglePassword(button: HTMLButtonElement): void {
  const input = button
    .closest(CONTROL_SELECTOR)
    ?.querySelector<HTMLInputElement>(`:scope ${INPUT_SELECTOR}`);

  if (!input) {
    return;
  }

  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(isHidden));
  button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

function buildSession(user: User, displayNameOverride?: string): AppSession {
  const displayName = displayNameOverride ?? user.displayName ?? user.email ?? 'Player';

  return {
    displayName,
    email: user.email ?? '',
    authenticatedAt: Date.now(),
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };
}

function createAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.dataset.mode = DEFAULT_MODE;
  dialog.setAttribute('aria-label', 'Log in or register');
  dialog.innerHTML = `
    <div class="auth-dialog__content">
      <div class="auth-dialog__tabs" role="tablist" aria-label="Authentication mode">
        <button
          class="auth-dialog__tab"
          id="auth-tab-login"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="auth-panel-login"
          data-switch-to="login"
        >
          Login
        </button>
        <button
          class="auth-dialog__tab"
          id="auth-tab-register"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="auth-panel-register"
          data-switch-to="register"
        >
          Register
        </button>
      </div>

      <section
        class="auth-dialog__panel auth-dialog__panel--login"
        id="auth-panel-login"
        role="tabpanel"
        aria-labelledby="auth-tab-login"
      >
        <header class="auth-dialog__header">
          <h2 class="auth-dialog__title" id="auth-login-title">Welcome Back!</h2>
          <p class="auth-dialog__subtitle">Sign in to resume your games and progress.</p>
        </header>
        <form class="auth-dialog__form" aria-labelledby="auth-login-title">
          <div class="auth-dialog__fields">
            ${createField({
              id: 'login-email',
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'e.g. alex@minigames.com',
              icon: mailIcon,
              autocomplete: 'email',
            })}
            ${createField({
              id: 'login-password',
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: '••••••••',
              icon: lockIcon,
              autocomplete: 'current-password',
              withToggle: true,
            })}
          </div>
          <div class="auth-dialog__links-row">
            <button class="auth-dialog__link" type="button">Forgot Password?</button>
          </div>
          ${createActions(LOGIN_SUBMIT_LABEL, 'Continue with Google')}
        </form>
        <p class="auth-dialog__switch">
          Don't have an account?
          <button class="auth-dialog__link" type="button" data-switch-to="register">Register</button>
        </p>
      </section>

      <section
        class="auth-dialog__panel auth-dialog__panel--register"
        id="auth-panel-register"
        role="tabpanel"
        aria-labelledby="auth-tab-register"
      >
        <header class="auth-dialog__header">
          <h2 class="auth-dialog__title" id="auth-register-title">Create Account</h2>
          <p class="auth-dialog__subtitle">Join MiniGames to track your score &amp; streak.</p>
        </header>
        <form class="auth-dialog__form" aria-labelledby="auth-register-title">
          <div class="auth-dialog__fields">
            ${createField({
              id: 'register-username',
              name: 'username',
              label: 'Username',
              type: 'text',
              placeholder: 'e.g. CozyGamer_99',
              icon: userIcon,
              autocomplete: 'username',
            })}
            ${createField({
              id: 'register-email',
              name: 'email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'your.email@domain.com',
              icon: mailIcon,
              autocomplete: 'email',
            })}
            ${createField({
              id: 'register-password',
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: `Min. ${PASSWORD_MIN_LENGTH} characters`,
              icon: lockIcon,
              autocomplete: 'new-password',
              minLength: PASSWORD_MIN_LENGTH,
            })}
            ${createField({
              id: 'register-confirm-password',
              name: 'confirmPassword',
              label: 'Confirm Password',
              type: 'password',
              placeholder: 'Repeat your password',
              icon: lockIcon,
              autocomplete: 'new-password',
            })}
          </div>
          ${createActions(REGISTER_SUBMIT_LABEL, 'Sign up with Google')}
        </form>
        <p class="auth-dialog__switch">
          Already have an account?
          <button class="auth-dialog__link" type="button" data-switch-to="login">Login</button>
        </p>
      </section>
    </div>
  `;

  const loginFormOrNull = dialog.querySelector<HTMLFormElement>(
    ':scope #auth-panel-login .auth-dialog__form'
  );
  const registerFormOrNull = dialog.querySelector<HTMLFormElement>(
    ':scope #auth-panel-register .auth-dialog__form'
  );

  if (!loginFormOrNull || !registerFormOrNull) {
    throw new Error('Auth dialog is missing the login or register form.');
  }

  const loginForm: HTMLFormElement = loginFormOrNull;
  const registerForm: HTMLFormElement = registerFormOrNull;

  loginForm.noValidate = true;
  registerForm.noValidate = true;

  const loginSubmitOrNull = loginForm.querySelector<HTMLButtonElement>(
    ':scope .auth-dialog__submit'
  );
  const registerSubmitOrNull = registerForm.querySelector<HTMLButtonElement>(
    ':scope .auth-dialog__submit'
  );

  if (!loginSubmitOrNull || !registerSubmitOrNull) {
    throw new Error('Auth dialog is missing a submit button.');
  }

  const loginSubmit: HTMLButtonElement = loginSubmitOrNull;
  const registerSubmit: HTMLButtonElement = registerSubmitOrNull;

  const loginGoogle = loginForm.querySelector<HTMLButtonElement>(':scope .auth-dialog__google');
  const registerGoogle = registerForm.querySelector<HTMLButtonElement>(
    ':scope .auth-dialog__google'
  );

  const loginEmailField = createFieldController(loginForm, 'login-email', (input) =>
    validateEmail(input.value)
  );
  const loginPasswordField = createFieldController(loginForm, 'login-password', (input) =>
    validateLoginPassword(input.value)
  );
  const resetLoginValidation = setupFormValidation(loginSubmit, [
    loginEmailField,
    loginPasswordField,
  ]);

  const usernameField = createFieldController(registerForm, 'register-username', (input) =>
    validateUsername(input.value)
  );
  const registerEmailField = createFieldController(registerForm, 'register-email', (input) =>
    validateEmail(input.value)
  );
  const registerPasswordField = createFieldController(registerForm, 'register-password', (input) =>
    validateRegisterPassword(input.value)
  );
  const confirmPasswordField = createFieldController(
    registerForm,
    'register-confirm-password',
    (input) => validateConfirmPassword(input.value, registerPasswordField.input.value)
  );
  const resetRegisterValidation = setupFormValidation(
    registerSubmit,
    [usernameField, registerEmailField, registerPasswordField, confirmPasswordField],
    [[registerPasswordField.input, [confirmPasswordField]]]
  );

  function resetAllValidation(): void {
    loginForm.reset();
    registerForm.reset();
    resetLoginValidation();
    resetRegisterValidation();
  }

  let isAuthPending = false;

  function setPendingState(isPending: boolean): void {
    isAuthPending = isPending;
    dialog.dataset.pending = String(isPending);

    for (const control of dialog.querySelectorAll<HTMLButtonElement>(`:scope ${SWITCH_SELECTOR}`)) {
      control.disabled = isPending;
    }

    for (const field of [
      loginEmailField,
      loginPasswordField,
      usernameField,
      registerEmailField,
      registerPasswordField,
      confirmPasswordField,
    ]) {
      field.input.disabled = isPending;
    }

    for (const button of [loginGoogle, registerGoogle]) {
      if (button) {
        button.disabled = isPending;
      }
    }

    loginSubmit.disabled =
      isPending || [loginEmailField, loginPasswordField].some((field) => field.validate());
    registerSubmit.disabled =
      isPending ||
      [usernameField, registerEmailField, registerPasswordField, confirmPasswordField].some(
        (field) => field.validate()
      );

    loginSubmit.textContent = isPending ? LOGIN_PENDING_LABEL : LOGIN_SUBMIT_LABEL;
    registerSubmit.textContent = isPending ? REGISTER_PENDING_LABEL : REGISTER_SUBMIT_LABEL;
  }

  function completeAuthSuccess(user: User, displayNameOverride?: string): void {
    const session = buildSession(user, displayNameOverride);

    saveSession(session);
    setCurrentSession(session);
    setPendingState(false);
    resetAllValidation();
    dialog.close();
    showSnackbar(`Welcome, ${session.displayName}!`, 'success');
  }

  async function handleLoginSubmit(): Promise<void> {
    if (loginEmailField.validate() || loginPasswordField.validate()) {
      return;
    }

    setPendingState(true);

    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        loginEmailField.input.value.trim(),
        loginPasswordField.input.value
      );

      completeAuthSuccess(credential.user);
    } catch (error) {
      setPendingState(false);
      showSnackbar(getAuthErrorMessage(error), 'error');
    }
  }

  async function handleRegisterSubmit(): Promise<void> {
    if (
      usernameField.validate() ||
      registerEmailField.validate() ||
      registerPasswordField.validate() ||
      confirmPasswordField.validate()
    ) {
      return;
    }

    setPendingState(true);

    try {
      const username = usernameField.input.value.trim();
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        registerEmailField.input.value.trim(),
        registerPasswordField.input.value
      );

      await updateProfile(credential.user, { displayName: username });
      completeAuthSuccess(credential.user, username);
    } catch (error) {
      setPendingState(false);
      showSnackbar(getAuthErrorMessage(error), 'error');
    }
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      if (!isAuthPending) {
        dialog.close();
      }
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const passwordToggle = event.target.closest<HTMLButtonElement>(PASSWORD_TOGGLE_SELECTOR);

    if (passwordToggle) {
      togglePassword(passwordToggle);
      return;
    }

    const trigger = event.target.closest<HTMLElement>(SWITCH_SELECTOR);
    const mode = trigger?.dataset.switchTo;

    if (!isAuthMode(mode)) {
      return;
    }

    switchMode(dialog, mode, resetAllValidation);
    navigate(withAuthParameter(mode), { replace: true });
  });

  dialog.addEventListener('cancel', (event) => {
    if (isAuthPending) {
      event.preventDefault();
    }
  });

  dialog.addEventListener('submit', (event) => {
    event.preventDefault();

    if (isAuthPending) {
      return;
    }

    if (event.target === loginForm) {
      void handleLoginSubmit();
    } else if (event.target === registerForm) {
      void handleRegisterSubmit();
    }
  });

  dialog.addEventListener('close', () => {
    navigate(withoutAuthParameter(), { replace: true });
  });

  return dialog;
}

function getAuthDialog(): HTMLDialogElement {
  const existingDialog = document.querySelector<HTMLDialogElement>(DIALOG_SELECTOR);

  if (existingDialog) {
    return existingDialog;
  }

  const dialog = createAuthDialog();
  document.body.append(dialog);

  return dialog;
}

export function closeAuthDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>(DIALOG_SELECTOR);

  if (dialog?.open && dialog.dataset.pending !== 'true') {
    dialog.close();
  }
}

export function openAuthDialog(mode: AuthMode): void {
  const dialog = getAuthDialog();

  switchMode(dialog, mode);

  if (!dialog.open) {
    dialog.showModal();
  }
}
