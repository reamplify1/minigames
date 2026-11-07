import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { DialogNavigationService, type AuthMode } from '../../core/dialog-navigation.service';
import { SnackbarService } from '../../core/snackbar.service';
import { getAuthErrorMessage, isGoogleCancellation } from './auth-errors';
import { LoginForm, type LoginValues } from './login-form';
import { RegisterForm, type RegisterValues } from './register-form';

@Component({
  selector: 'app-auth-dialog',
  imports: [LoginForm, RegisterForm],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AuthDialog {
  readonly mode = input<AuthMode>();

  private readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly loginForm = viewChild.required<LoginForm>(LoginForm);
  private readonly registerForm = viewChild.required<RegisterForm>(RegisterForm);

  protected readonly activeMode = linkedSignal<AuthMode | undefined, AuthMode>({
    source: this.mode,
    computation: (
      mode: AuthMode | undefined,
      previous: { source: AuthMode | undefined; value: AuthMode } | undefined
    ): AuthMode => mode ?? previous?.value ?? 'login',
  });

  protected readonly pending = signal<boolean>(false);

  constructor() {
    effect((): void => {
      const dialog = this.dialog().nativeElement;

      if (this.mode() && !dialog.open) {
        dialog.showModal();
      } else if (!this.mode() && dialog.open && !this.pending()) {
        dialog.close();
      }
    });
  }

  protected switchMode(mode: AuthMode, tab: HTMLElement): void {
    if (mode !== this.activeMode()) {
      this.resetForms();
      this.dialogs.switchAuthMode(mode);
      tab.focus();
    }
  }

  protected login({ email, password }: LoginValues): void {
    void this.runAuth((): Promise<void> => this.auth.login(email, password));
  }

  protected register({ username, email, password }: RegisterValues): void {
    void this.runAuth((): Promise<void> => this.auth.register(email, password, username));
  }

  protected loginWithGoogle(): void {
    void this.runAuth((): Promise<void> => this.auth.loginWithGoogle());
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement && !this.pending()) {
      this.dialog().nativeElement.close();
    }
  }

  protected onCancel(event: Event): void {
    if (this.pending()) {
      event.preventDefault();
    }
  }

  protected onClose(): void {
    if (this.mode()) {
      this.dialogs.closeAuth();
    }
  }

  private async runAuth(task: () => Promise<void>): Promise<void> {
    this.pending.set(true);

    try {
      await task();
      this.pending.set(false);
      this.resetForms();
      this.dialog().nativeElement.close();
    } catch (error) {
      this.pending.set(false);

      if (!isGoogleCancellation(error)) {
        this.snackbar.show(getAuthErrorMessage(error), 'error');
      }
    }
  }

  private resetForms(): void {
    this.loginForm().reset();
    this.registerForm().reset();
  }
}
