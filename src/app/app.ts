import { Component, computed, inject, type Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  type ParamMap,
  Router,
  type Event as RouterEvent,
  RouterOutlet,
} from '@angular/router';
import { filter, tap } from 'rxjs';
import { AuthDialog } from './components/auth-dialog/auth-dialog';
import { Footer } from './components/footer/footer';
import { GameDetailsDialog } from './components/game-details-dialog/game-details-dialog';
import { Header } from './components/header/header';
import { SnackbarHost } from './components/snackbar/snackbar';
import { AuthService } from './core/auth.service';
import {
  type AuthMode,
  DialogNavigationService,
  isAuthMode,
} from './core/dialog-navigation.service';
import { SnackbarService } from './core/snackbar.service';

const ALREADY_AUTHENTICATED_MESSAGE: string = "You're already signed in.";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, SnackbarHost, AuthDialog, GameDetailsDialog],
  templateUrl: './app.html',
  host: {
    '(window:focus)': 'auth.checkSessionExpiration()',
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class App {
  protected readonly auth: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);
  private readonly queryParams: Signal<ParamMap | undefined> = toSignal(
    inject(ActivatedRoute).queryParamMap
  );

  protected readonly authMode = computed<AuthMode | undefined>((): AuthMode | undefined => {
    const mode = this.queryParams()?.get('auth') ?? null;
    return isAuthMode(mode) ? mode : undefined;
  });

  protected readonly gameSlug = computed<string | undefined>((): string | undefined => {
    const slug = this.queryParams()?.get('game');
    return slug && !this.authMode() ? slug : undefined;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationStart => event instanceof NavigationStart),
        tap((): void => this.auth.checkSessionExpiration()),
        takeUntilDestroyed()
      )
      .subscribe();

    this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
        tap((): void => this.closeLoginForSignedInUser()),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  protected onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.auth.checkSessionExpiration();
    }
  }

  private closeLoginForSignedInUser(): void {
    if (this.authMode() && this.auth.session()) {
      this.snackbar.show(ALREADY_AUTHENTICATED_MESSAGE, 'success');
      this.dialogs.closeAuth();
    }
  }
}
