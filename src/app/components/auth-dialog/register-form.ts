import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { AuthField, toValidator } from './auth-field';
import {
  validateConfirmPassword,
  validateEmail,
  validateRegisterPassword,
  validateUsername,
} from './auth-validation';

const PASSWORD_MIN_LENGTH: number = 6;

export interface RegisterValues {
  username: string;
  email: string;
  password: string;
}

interface RegisterFormControls {
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, AuthField],
  template: `
    <form
      class="auth-dialog__form"
      aria-labelledby="auth-register-title"
      [formGroup]="form"
      (ngSubmit)="submit()"
    >
      <div class="auth-dialog__fields">
        <app-auth-field
          inputId="register-username"
          name="username"
          label="Username"
          type="text"
          placeholder="e.g. CozyGamer_99"
          icon="assets/icons/user-icon.svg"
          autocomplete="username"
          [control]="form.controls.username"
        />
        <app-auth-field
          inputId="register-email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="your.email@domain.com"
          icon="assets/icons/mail-icon.svg"
          autocomplete="email"
          [control]="form.controls.email"
        />
        <app-auth-field
          inputId="register-password"
          name="password"
          label="Password"
          type="password"
          [placeholder]="'Min. ' + passwordMinLength + ' characters'"
          icon="assets/icons/lock-icon.svg"
          autocomplete="new-password"
          [control]="form.controls.password"
          [minLength]="passwordMinLength"
        />
        <app-auth-field
          inputId="register-confirm-password"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          icon="assets/icons/lock-icon.svg"
          autocomplete="new-password"
          [control]="form.controls.confirmPassword"
        />
      </div>
      <div class="auth-dialog__actions">
        <button class="auth-dialog__submit" type="submit" [disabled]="pending() || form.invalid">
          {{ pending() ? 'Creating account…' : 'Create Account' }}
        </button>
        <p class="auth-dialog__divider">or</p>
        <button
          class="auth-dialog__google"
          type="button"
          [disabled]="pending()"
          (click)="googleClick.emit()"
        >
          <img class="auth-dialog__google-icon" src="assets/icons/google-icon.svg" alt="" />
          Sign up with Google
        </button>
      </div>
    </form>
  `,
})
export class RegisterForm {
  readonly pending = input.required<boolean>();
  readonly register = output<RegisterValues>();
  readonly googleClick = output<void>();

  protected readonly passwordMinLength: number = PASSWORD_MIN_LENGTH;

  private readonly password: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
    validators: toValidator(validateRegisterPassword),
  });

  protected readonly form: FormGroup<RegisterFormControls> = new FormGroup<RegisterFormControls>({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: toValidator(validateUsername),
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: toValidator(validateEmail),
    }),
    password: this.password,
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: toValidator((value: string): string | undefined =>
        validateConfirmPassword(value, this.password.value)
      ),
    }),
  });

  constructor() {
    this.password.valueChanges
      .pipe(
        tap((): void => this.form.controls.confirmPassword.updateValueAndValidity()),
        takeUntilDestroyed()
      )
      .subscribe();

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
      const { username, email, password } = this.form.getRawValue();
      this.register.emit({ username: username.trim(), email: email.trim(), password });
    }
  }
}
