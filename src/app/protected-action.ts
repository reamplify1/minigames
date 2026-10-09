import { checkSessionExpiration, getCurrentSession } from './auth-state';
import { withAuthParameter } from './dialog-urls';
import { navigate } from './router';
import { showSnackbar } from '../components/snackbar/snackbar';

// Guards an action that requires an authenticated app session (favoriting,
// commenting, liking, etc. — RSS-QS-4-3-2's "Protected Action after
// Expiration"). If the session is missing or just expired, the action is
// never dispatched: Auth opens instead, while the current URL (including
// any "game" parameter) is preserved so Game Details can be restored once
// Auth resolves. The user must retry the action explicitly afterwards.
//
// `guestMessage`, when given, is shown as a warning Snackbar after opening
// Auth — callers that need their own guest-facing copy pass it; callers that
// don't (existing call sites) keep their previous silent-redirect behavior.
//
// Auth opens BEFORE the Snackbar is shown (not after): a native <dialog>'s
// backdrop paints in the browser's "top layer", above everything outside the
// dialog regardless of z-index. Showing the Snackbar first would put it
// behind that backdrop the instant the dialog opens; opening first lets the
// Snackbar's own container detect the already-open dialog and render inside
// it instead, on top of the backdrop.
export function runProtectedAction(action: () => void, guestMessage?: string): void {
  checkSessionExpiration();

  if (getCurrentSession() === undefined) {
    navigate(withAuthParameter('login'));

    if (guestMessage) {
      showSnackbar(guestMessage, 'error');
    }

    return;
  }

  action();
}
