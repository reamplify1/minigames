import './auth-dialog.scss';
import mailIcon from '../../assets/icons/mail-icon.svg';
import lockIcon from '../../assets/icons/lock-icon.svg';
import eyeIcon from '../../assets/icons/eye-icon.svg';
import userIcon from '../../assets/icons/user-icon.svg';
import googleIcon from '../../assets/icons/google-icon.svg';
import { navigate } from '../../app/router';
import { withAuthParameter, withoutAuthParameter } from '../../app/dialog-urls';
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
          ${createActions('Login', 'Continue with Google')}
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
          ${createActions('Create Account', 'Sign up with Google')}
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

  const loginSubmit = loginForm.querySelector<HTMLButtonElement>(':scope .auth-dialog__submit');
  const registerSubmit = registerForm.querySelector<HTMLButtonElement>(
    ':scope .auth-dialog__submit'
  );

  if (!loginSubmit || !registerSubmit) {
    throw new Error('Auth dialog is missing a submit button.');
  }

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

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
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

  dialog.addEventListener('submit', (event) => {
    event.preventDefault();
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

  if (dialog?.open) {
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
