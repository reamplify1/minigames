import { Component, computed, input, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';

export type AuthFieldType = 'text' | 'email' | 'password';

export function toValidator(validate: (value: string) => string | undefined): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const message = validate(String(control.value ?? ''));
    return message ? { message } : null;
  };
}

@Component({
  selector: 'app-auth-field',
  imports: [ReactiveFormsModule],
  template: `
    <div class="auth-dialog__field" [class.auth-dialog__field--invalid]="errorMessage()">
      <label class="auth-dialog__label" [for]="inputId()">{{ label() }}</label>
      <div class="auth-dialog__control">
        <img class="auth-dialog__control-icon" [src]="icon()" alt="" />
        <input
          class="auth-dialog__input"
          [id]="inputId()"
          [name]="name()"
          [type]="inputType()"
          [placeholder]="placeholder()"
          [autocomplete]="autocomplete()"
          [formControl]="control()"
          [attr.minlength]="minLength()"
          [attr.autocapitalize]="type() === 'password' ? null : 'none'"
          [attr.spellcheck]="type() === 'password' ? null : 'false'"
          [attr.aria-describedby]="inputId() + '-error'"
          [attr.aria-invalid]="control().invalid"
          required
        />
        @if (withToggle()) {
          <button
            class="auth-dialog__toggle"
            type="button"
            [attr.aria-label]="isPasswordVisible() ? 'Hide password' : 'Show password'"
            [attr.aria-pressed]="isPasswordVisible()"
            (click)="togglePassword()"
          >
            <img class="auth-dialog__toggle-icon" src="assets/icons/eye-icon.svg" alt="" />
          </button>
        }
      </div>
      <p class="auth-dialog__error" [id]="inputId() + '-error'" aria-live="polite">
        {{ errorMessage() }}
      </p>
    </div>
  `,
})
export class AuthField {
  readonly inputId = input.required<string>();
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input.required<AuthFieldType>();
  readonly placeholder = input.required<string>();
  readonly icon = input.required<string>();
  readonly autocomplete = input.required<string>();
  readonly control = input.required<FormControl<string>>();
  readonly minLength = input<number>();
  readonly withToggle = input<boolean>(false);

  protected readonly isPasswordVisible = signal<boolean>(false);

  protected readonly inputType = computed<AuthFieldType>((): AuthFieldType =>
    this.isPasswordVisible() ? 'text' : this.type()
  );

  protected errorMessage(): string {
    const control = this.control();
    const message: unknown = control.errors?.['message'];

    return control.touched && typeof message === 'string' ? message : '';
  }

  protected togglePassword(): void {
    this.isPasswordVisible.update((isVisible: boolean): boolean => !isVisible);
  }
}
