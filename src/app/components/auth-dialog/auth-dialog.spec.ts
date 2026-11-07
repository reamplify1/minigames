import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SnackbarService } from '../../core/snackbar.service';
import {
  createFakeFirebase,
  provideTestApp,
  type FakeFirebase,
  settle,
} from '../../testing/test-helpers';
import { AuthDialog } from './auth-dialog';

describe('AuthDialog', () => {
  let fixture: ComponentFixture<AuthDialog>;
  let firebase: FakeFirebase;

  beforeEach(async () => {
    localStorage.clear();
    firebase = createFakeFirebase();
    TestBed.configureTestingModule({ providers: provideTestApp(firebase) });
    fixture = TestBed.createComponent(AuthDialog);
    fixture.componentRef.setInput('mode', 'login');
    await settle();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function dialog(): HTMLDialogElement {
    return element().querySelector('dialog') as HTMLDialogElement;
  }

  function input(id: string): HTMLInputElement {
    return element().querySelector(`#${id}`) as HTMLInputElement;
  }

  function button(selector: string): HTMLButtonElement {
    return element().querySelector(selector) as HTMLButtonElement;
  }

  function fill(id: string, value: string): void {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input'));
    input(id).dispatchEvent(new Event('blur'));
  }

  function submit(panel: 'login' | 'register'): void {
    element()
      .querySelector(`#auth-panel-${panel} form`)
      ?.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  function fillValidLogin(): void {
    fill('login-email', ' forest@test.dev ');
    fill('login-password', 'secret1');
  }

  it('opens for a mode and closes when the mode is gone', async () => {
    expect(dialog().open).toBe(true);

    fixture.componentRef.setInput('mode', undefined);
    await settle();

    expect(dialog().open).toBe(false);
  });

  it('shows the panel of the current mode', () => {
    expect(dialog().dataset['mode']).toBe('login');
    expect(element().querySelector('[aria-selected="true"]')?.textContent).toContain('Login');
  });

  it('shows an error only after the user leaves the field', async () => {
    input('login-email').value = 'nope';
    input('login-email').dispatchEvent(new Event('input'));
    await settle();
    expect(element().querySelector('#login-email-error')?.textContent?.trim()).toBe('');

    input('login-email').dispatchEvent(new Event('blur'));
    await settle();
    expect(element().querySelector('#login-email-error')?.textContent?.trim()).toBe(
      'Enter a valid email address.'
    );
    expect(element().querySelector('.auth-dialog__field--invalid')).not.toBeNull();
  });

  it('enables submit only for a valid form', async () => {
    const submitButton = button('#auth-panel-login .auth-dialog__submit');
    expect(submitButton.disabled).toBe(true);

    fillValidLogin();
    await settle();

    expect(submitButton.disabled).toBe(false);
  });

  it('logs in with the trimmed email and closes', async () => {
    fillValidLogin();
    submit('login');
    await settle();

    expect(firebase.login).toHaveBeenCalledWith('forest@test.dev', 'secret1');
    expect(TestBed.inject(AuthService).session()?.email).toBe('forest@test.dev');
    expect(dialog().open).toBe(false);
    expect(input('login-email').value).toBe('');
  });

  it('stays open and shows a message when the login fails', async () => {
    firebase.login.mockRejectedValueOnce({ code: 'auth/invalid-credential' });

    fillValidLogin();
    submit('login');
    await settle();

    expect(dialog().open).toBe(true);
    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toBe(
      'Incorrect email or password.'
    );
  });

  it('locks the form and the Escape key during a login', async () => {
    let finishLogin: (user: object) => void = (): undefined => undefined;
    firebase.login.mockReturnValueOnce(
      new Promise((resolve) => {
        finishLogin = resolve;
      })
    );

    fillValidLogin();
    submit('login');
    await settle();

    const cancel = new Event('cancel', { cancelable: true });
    dialog().dispatchEvent(cancel);

    expect(input('login-email').disabled).toBe(true);
    expect(button('#auth-panel-login .auth-dialog__submit').textContent).toContain('Logging in…');
    expect(cancel.defaultPrevented).toBe(true);

    finishLogin({ email: 'forest@test.dev' });
    await settle();

    expect(input('login-email').disabled).toBe(false);
  });

  it('registers with the username', async () => {
    fixture.componentRef.setInput('mode', 'register');
    await settle();

    fill('register-username', 'Forest1');
    fill('register-email', 'forest@test.dev');
    fill('register-password', 'Abcdef1!');
    fill('register-confirm-password', 'Abcdef1!');
    submit('register');
    await settle();

    expect(firebase.register).toHaveBeenCalledWith('forest@test.dev', 'Abcdef1!', 'Forest1');
  });

  it('checks the confirmation again when the password changes', async () => {
    fill('register-password', 'Abcdef1!');
    fill('register-confirm-password', 'Abcdef1!');
    fill('register-password', 'Abcdef2!');
    await settle();

    expect(element().querySelector('#register-confirm-password-error')?.textContent?.trim()).toBe(
      'Passwords do not match.'
    );
  });

  it('stays quiet when the user closes the Google popup', async () => {
    firebase.loginWithGoogle.mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });

    button('.auth-dialog__google').click();
    await settle();

    expect(TestBed.inject(SnackbarService).messages()).toEqual([]);
    expect(dialog().open).toBe(true);
  });

  it('switches the mode in the URL and clears the forms', async () => {
    fillValidLogin();

    button('#auth-tab-register').click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/?auth=register');
    expect(input('login-email').value).toBe('');
  });

  it('shows and hides the password', async () => {
    const toggle = button('.auth-dialog__toggle');

    toggle.click();
    await settle();

    expect(input('login-password').type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
  });

  it('removes the mode from the URL after the user closes the dialog', async () => {
    await TestBed.inject(Router).navigateByUrl('/?auth=login&game=palia');

    dialog().close();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/?game=palia');
  });
});
