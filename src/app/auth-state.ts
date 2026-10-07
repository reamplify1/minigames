import { readSession, type AppSession } from './session';

type AuthStateListener = (session: AppSession | undefined) => void;

function createAuthStateStore() {
  let currentSession: AppSession | undefined = readSession();
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

  return { getCurrentSession, setCurrentSession, onAuthStateChange };
}

const authStateStore = createAuthStateStore();

export const getCurrentSession = authStateStore.getCurrentSession;
export const setCurrentSession = authStateStore.setCurrentSession;
export const onAuthStateChange = authStateStore.onAuthStateChange;
