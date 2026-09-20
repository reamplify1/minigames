import './auth-dialog.scss';
import mailIcon from '../../assets/icons/mail-icon.svg';
import lockIcon from '../../assets/icons/lock-icon.svg';
import eyeIcon from '../../assets/icons/eye-icon.svg';
import userIcon from '../../assets/icons/user-icon.svg';
import googleIcon from '../../assets/icons/google-icon.svg';

type AuthMode = 'login' | 'register';

const DEFAULT_MODE: AuthMode = 'login';
const DIALOG_SELECTOR = '.auth-dialog';
const TAB_SELECTOR = '.auth-dialog__tab';
const SWITCH_SELECTOR = '[data-switch-to]';

interface FieldOptions {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  icon: string;
  autocomplete: string;
  withToggle?: boolean;
}

function isAuthMode(value: string | undefined): value is AuthMode {
  return value === 'login' || value === 'register';
}

function createField(options: FieldOptions): string {
  const toggle = options.withToggle
    ? `<button class="auth-dialog__toggle" type="button" aria-label="Show password">
         <img class="auth-dialog__toggle-icon" src="${eyeIcon}" alt="" />
       </button>`
    : '';

  return `
    <div class="auth-dialog__field">
      <label class="auth-dialog__label" for="${options.id}">${options.label}</label>
      <div class="auth-dialog__control">
        <img class="auth-dialog__control-icon" src="${options.icon}" alt="" />
        <input
          class="auth-dialog__input"
          id="${options.id}"
          name="${options.id}"
          type="${options.type}"
          placeholder="${options.placeholder}"
          autocomplete="${options.autocomplete}"
          required
        />
        ${toggle}
      </div>
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

function switchMode(dialog: HTMLDialogElement, mode: AuthMode): void {
  if (dialog.dataset.mode === mode) {
    return;
  }

  dialog.dataset.mode = mode;

  const tabs = dialog.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR);

  for (const tab of tabs) {
    tab.setAttribute('aria-selected', String(tab.dataset.switchTo === mode));
  }

  dialog.querySelector<HTMLButtonElement>(`${TAB_SELECTOR}[aria-selected="true"]`)?.focus();
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
          <h2 class="auth-dialog__title">Welcome Back!</h2>
          <p class="auth-dialog__subtitle">Sign in to resume your games and progress.</p>
        </header>
        <form class="auth-dialog__form">
          <div class="auth-dialog__fields">
            ${createField({
              id: 'login-email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'e.g. alex@minigames.com',
              icon: mailIcon,
              autocomplete: 'email',
            })}
            ${createField({
              id: 'login-password',
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
          <h2 class="auth-dialog__title">Create Account</h2>
          <p class="auth-dialog__subtitle">Join MiniGames to track your score &amp; streak.</p>
        </header>
        <form class="auth-dialog__form">
          <div class="auth-dialog__fields">
            ${createField({
              id: 'register-username',
              label: 'Username',
              type: 'text',
              placeholder: 'e.g. CozyGamer_99',
              icon: userIcon,
              autocomplete: 'username',
            })}
            ${createField({
              id: 'register-email',
              label: 'Email Address',
              type: 'email',
              placeholder: 'your.email@domain.com',
              icon: mailIcon,
              autocomplete: 'email',
            })}
            ${createField({
              id: 'register-password',
              label: 'Password',
              type: 'password',
              placeholder: 'Min. 8 characters',
              icon: lockIcon,
              autocomplete: 'new-password',
            })}
            ${createField({
              id: 'register-confirm-password',
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

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest<HTMLElement>(SWITCH_SELECTOR);
    const mode = trigger?.dataset.switchTo;

    if (isAuthMode(mode)) {
      switchMode(dialog, mode);
    }
  });

  dialog.addEventListener('submit', (event) => {
    event.preventDefault();
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

export function openAuthDialog(): void {
  const dialog = getAuthDialog();

  if (!dialog.open) {
    dialog.showModal();
  }
}