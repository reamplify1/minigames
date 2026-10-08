import { onLocationChange, type RouteContext } from './router';
import {
  openGameDetailsDialog,
  closeGameDetailsDialog,
} from '../components/game-details-dialog/game-details-dialog';
import { openAuthDialog, closeAuthDialog, isAuthMode } from '../components/auth-dialog/auth-dialog';

function syncDialogs(context: RouteContext): void {
  const gameSlug = context.searchParams.get('game');
  const authMode = context.searchParams.get('auth');

  // Auth takes priority so only one dialog is ever active. The "game"
  // parameter can still be present in the URL while Auth is open (a
  // protected action keeps it there on purpose) — Game Details simply stays
  // hidden until Auth closes, at which point this same sync reopens it.
  if (isAuthMode(authMode)) {
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
