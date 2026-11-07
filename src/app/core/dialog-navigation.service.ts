import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';

export type AuthMode = 'login' | 'register';

export function isAuthMode(value: string | null): value is AuthMode {
  return value === 'login' || value === 'register';
}

@Injectable({ providedIn: 'root' })
export class DialogNavigationService {
  private readonly router: Router = inject(Router);
  private readonly auth: AuthService = inject(AuthService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  openGame(slug: string): void {
    void this.setQueryParams({ game: slug, auth: null });
  }

  closeGame(): void {
    void this.setQueryParams({ game: null }, true);
  }

  openAuth(mode: AuthMode): Promise<boolean> {
    return this.setQueryParams({ auth: mode });
  }

  switchAuthMode(mode: AuthMode): void {
    void this.setQueryParams({ auth: mode }, true);
  }

  closeAuth(): void {
    void this.setQueryParams({ auth: null }, true);
  }

  runProtected(action: () => void, guestMessage?: string): void {
    this.auth.checkSessionExpiration();

    if (this.auth.session()) {
      action();
      return;
    }

    void this.openAuth('login').then((): void => {
      if (guestMessage) {
        this.snackbar.show(guestMessage, 'error');
      }
    });
  }

  private setQueryParams(
    queryParams: Record<string, string | null>,
    replaceUrl: boolean = false
  ): Promise<boolean> {
    return this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
