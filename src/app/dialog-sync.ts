import { onLocationChange, type RouteContext } from './router';
import {
  openGameDetailsDialog,
  closeGameDetailsDialog,
} from '../components/game-details-dialog/game-details-dialog';
import { openAuthDialog, closeAuthDialog, isAuthMode } from '../components/auth-dialog/auth-dialog';

function syncDialogs(context: RouteContext): void {
  const gameSlug = context.searchParams.get('game');
  const authMode = context.searchParams.get('auth');

  if (gameSlug) {
    openGameDetailsDialog(gameSlug);
  } else {
    closeGameDetailsDialog();
  }

  if (isAuthMode(authMode)) {
    openAuthDialog(authMode);
  } else {
    closeAuthDialog();
  }
}

export function initDialogSync(): void {
  onLocationChange(syncDialogs);
}
