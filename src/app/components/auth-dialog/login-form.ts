import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthField, toValidator } from './auth-field';
import { validateEmail, validateLoginPassword } from './auth-validation';

export interface LoginValues {
  email: string;
  password: string;
}

interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, AuthField],
  template: `
    <form
      class="auth-dialog__form"
      aria-labelledby="auth-login-title"
      [formGroup]="form"
      (ngSubmit)="submit()"
    >
      <div class="auth-dialog__fields">
        <app-auth-field
          inputId="login-email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="e.g. alex@minigames.com"
          icon="assets/icons/mail-icon.svg"
          autocomplete="email"
          [control]="form.controls.email"
        />
        <app-auth-field
          inputId="login-password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          icon="assets/icons/lock-icon.svg"
          autocomplete="current-password"
          [control]="form.controls.password"
          [withToggle]="true"
        />
      </div>
      <div class="auth-dialog__links-row">
        <button class="auth-dialog__link" type="button">Forgot Password?</button>
      </div>
      <div class="auth-dialog__actions">
        <button class="auth-dialog__submit" type="submit" [disabled]="pending() || form.invalid">
          {{ pending() ? 'Logging in…' : 'Login' }}
        </button>
        <p class="auth-dialog__divider">or</p>
        <button
          class="auth-dialog__google"
          type="button"
          [disabled]="pending()"
          (click)="googleClick.emit()"
        >
          <img class="auth-dialog__google-icon" src="assets/icons/google-icon.svg" alt="" />
          Continue with Google
        </button>
      </div>
    </form>
  `,
})
export class LoginForm {
  readonly pending = input.required<boolean>();
  readonly login = output<LoginValues>();
  readonly googleClick = output<void>();

  protected readonly form: FormGroup<LoginFormControls> = new FormGroup<LoginFormControls>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: toValidator(validateEmail),
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: toValidator(validateLoginPassword),
    }),
  });

  constructor() {
    effect((): void => {
      if (this.pending()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  reset(): void {
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.valid && !this.pending()) {
      const { email, password } = this.form.getRawValue();
      this.login.emit({ email: email.trim(), password });
    }
  }
}
