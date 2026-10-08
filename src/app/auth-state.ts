import { signOut } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebase-config';
import { showSnackbar } from '../components/snackbar/snackbar';
import { clearSession, readStoredSession, type AppSession } from './session';

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

type AuthStateListener = (session: AppSession | undefined) => void;

function createAuthStateStore() {
  let currentSession: AppSession | undefined;
  const listeners: AuthStateListener[] = [];

  function getCurrentSession(): AppSession | undefined {
    return currentSession;
  }

  function setCurrentSession(session: AppSession | undefined): void {
    currentSession = session;

    for (const listener of listeners) {
      listener(session);
    }
  }

  function onAuthStateChange(listener: AuthStateListener): void {
    listeners.push(listener);
  }

  function checkSessionExpiration(): void {
    const stored = readStoredSession();

    if (stored.status === 'valid') {
      if (stored.session) {
        currentSession ??= stored.session;
      }
      return;
    }

    if (currentSession === undefined && stored.status === 'none') {
      return;
    }

    clearSession();
    void signOut(firebaseAuth).catch(() => {});
    setCurrentSession(undefined);

    if (stored.status === 'expired') {
      showSnackbar(SESSION_EXPIRED_MESSAGE, 'error');
    }
  }

  checkSessionExpiration();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkSessionExpiration();
    }
  });
  globalThis.addEventListener('focus', checkSessionExpiration);

  return { getCurrentSession, setCurrentSession, onAuthStateChange, checkSessionExpiration };
}

const authStateStore = createAuthStateStore();

export const getCurrentSession = authStateStore.getCurrentSession;
export const setCurrentSession = authStateStore.setCurrentSession;
export const onAuthStateChange = authStateStore.onAuthStateChange;
export const checkSessionExpiration = authStateStore.checkSessionExpiration;
