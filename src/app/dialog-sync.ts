import { onLocationChange, navigate, type RouteContext } from './router';
import { withoutAuthParameter } from './dialog-urls';
import { checkSessionExpiration, getCurrentSession } from './auth-state';
import { showSnackbar } from '../components/snackbar/snackbar';
import {
  openGameDetailsDialog,
  closeGameDetailsDialog,
} from '../components/game-details-dialog/game-details-dialog';
import { openAuthDialog, closeAuthDialog, isAuthMode } from '../components/auth-dialog/auth-dialog';

const ALREADY_AUTHENTICATED_MESSAGE = "You're already signed in.";

function syncDialogs(context: RouteContext): void {
  const gameSlug = context.searchParams.get('game');
  const authMode = context.searchParams.get('auth');

  if (isAuthMode(authMode)) {
    checkSessionExpiration();

    if (getCurrentSession()) {
      showSnackbar(ALREADY_AUTHENTICATED_MESSAGE, 'success');
      navigate(withoutAuthParameter(), { replace: true });
      return;
    }

    closeGameDetailsDialog();
    openAuthDialog(authMode);
    return;
  }

  closeAuthDialog();

  if (gameSlug) {
    openGameDetailsDialog(gameSlug);
  } else {
    closeGameDetailsDialog();
  }
}

export function initDialogSync(): void {
  onLocationChange(syncDialogs);
}
