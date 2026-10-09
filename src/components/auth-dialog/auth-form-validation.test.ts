import { describe, it, expect } from 'vitest';
import { createFieldController, setupFormValidation } from './auth-form-validation';

function buildForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form>
      <div class="auth-dialog__field">
        <input id="email" />
        <p id="email-error"></p>
      </div>
      <div class="auth-dialog__field">
        <input id="password" />
        <p id="password-error"></p>
      </div>
      <button type="submit"></button>
    </form>
  `;

  return document.querySelector('form') as HTMLFormElement;
}

describe('createFieldController', () => {
  it('throws when the form is missing the input for the given id', () => {
    const form = buildForm();

    expect(() => createFieldController(form, 'missing', () => {})).toThrow(
      'Auth dialog form is missing required element "#missing".'
    );
  });

  it('wires the input, its error element and its wrapping field together', () => {
    const form = buildForm();
    const field = createFieldController(form, 'email', (input) =>
      input.value ? undefined : 'Email is required.'
    );

    expect(field.input.id).toBe('email');
    expect(field.errorElement.id).toBe('email-error');
    expect(field.fieldElement).toBe(field.input.closest('.auth-dialog__field'));
    expect(field.validate()).toBe('Email is required.');

    field.input.value = 'student@rs.school';
    expect(field.validate()).toBeUndefined();
  });
});

describe('setupFormValidation', () => {
  it('keeps the submit button disabled while any field is invalid', () => {
    const form = buildForm();
    const submit = form.querySelector('button') as HTMLButtonElement;
    const email = createFieldController(form, 'email', (input) =>
      input.value ? undefined : 'Email is required.'
    );
    const password = createFieldController(form, 'password', (input) =>
      input.value ? undefined : 'Password is required.'
    );

    setupFormValidation(submit, [email, password]);

    expect(submit.disabled).toBe(true);
  });

  it('enables the submit button once every field is valid', () => {
    const form = buildForm();
    const submit = form.querySelector('button') as HTMLButtonElement;
    const email = createFieldController(form, 'email', (input) =>
      input.value ? undefined : 'Email is required.'
    );

    setupFormValidation(submit, [email]);
    email.input.value = 'student@rs.school';
    email.input.dispatchEvent(new Event('input'));

    expect(submit.disabled).toBe(false);
  });

  it('only shows a field error after it has been touched (blurred)', () => {
    const form = buildForm();
    const submit = form.querySelector('button') as HTMLButtonElement;
    const email = createFieldController(form, 'email', (input) =>
      input.value ? undefined : 'Email is required.'
    );

    setupFormValidation(submit, [email]);

    email.input.dispatchEvent(new Event('input'));
    expect(email.errorElement.textContent).toBe('');

    email.input.dispatchEvent(new Event('blur'));
    expect(email.errorElement.textContent).toBe('Email is required.');
    expect(email.input.getAttribute('aria-invalid')).toBe('true');
  });

  it('revalidates a dependent field when its trigger field changes', () => {
    const form = buildForm();
    const submit = form.querySelector('button') as HTMLButtonElement;
    const trigger = createFieldController(form, 'email', (input) =>
      input.value.length >= 6 ? undefined : 'Password must be at least 6 characters.'
    );
    const dependent = createFieldController(form, 'password', (input) =>
      input.value === trigger.input.value ? undefined : 'Passwords do not match.'
    );

    setupFormValidation(submit, [trigger, dependent], [[trigger.input, [dependent]]]);

    trigger.input.value = 'secret1';
    dependent.input.value = 'secret1';
    dependent.input.dispatchEvent(new Event('blur'));
    expect(dependent.errorElement.textContent).toBe('');

    trigger.input.value = 'secret2';
    trigger.input.dispatchEvent(new Event('input'));

    expect(dependent.errorElement.textContent).toBe('Passwords do not match.');
  });

  it('reset() clears touched state, error text and invalid styling', () => {
    const form = buildForm();
    const submit = form.querySelector('button') as HTMLButtonElement;
    const email = createFieldController(form, 'email', (input) =>
      input.value ? undefined : 'Email is required.'
    );

    const reset = setupFormValidation(submit, [email]);
    email.input.dispatchEvent(new Event('blur'));
    expect(email.errorElement.textContent).toBe('Email is required.');

    reset();

    expect(email.errorElement.textContent).toBe('');
    expect(email.input.getAttribute('aria-invalid')).toBe('false');
    expect(email.fieldElement?.classList.contains('auth-dialog__field--invalid')).toBe(false);
  });
});
