import { checkSessionExpiration, getCurrentSession } from './auth-state';
import { withAuthParameter } from './dialog-urls';
import { navigate } from './router';

// Guards an action that requires an authenticated app session (favoriting,
// commenting, liking, etc. — RSS-QS-4-3-2's "Protected Action after
// Expiration"). If the session is missing or just expired, the action is
// never dispatched: Auth opens instead, while the current URL (including
// any "game" parameter) is preserved so Game Details can be restored once
// Auth resolves. The user must retry the action explicitly afterwards.
export function runProtectedAction(action: () => void): void {
  checkSessionExpiration();

  if (getCurrentSession() === undefined) {
    navigate(withAuthParameter('login'));
    return;
  }

  action();
}
