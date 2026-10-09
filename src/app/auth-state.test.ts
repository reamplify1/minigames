import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SESSION_KEY, type AppSession } from './session';

const { signOutMock, showSnackbarMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  showSnackbarMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({ signOut: signOutMock }));
vi.mock('../firebase/firebase-config', () => ({ firebaseAuth: {} }));
vi.mock('../components/snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function buildSession(authenticatedAt: number): AppSession {
  return {
    displayName: 'ForestDweller',
    email: 'student@rs.school',
    authenticatedAt,
  };
}

describe('auth-state', () => {
  beforeEach(() => {
    vi.resetModules();
    signOutMock.mockReset();
    signOutMock.mockResolvedValue(undefined);
    showSnackbarMock.mockClear();
    localStorage.clear();
  });

  it('starts with no session when nothing is stored', async () => {
    const { getCurrentSession } = await import('./auth-state');

    expect(getCurrentSession()).toBeUndefined();
  });

  it('adopts a valid stored session on load without signing out', async () => {
    const session = buildSession(Date.now());
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const { getCurrentSession } = await import('./auth-state');

    expect(getCurrentSession()).toEqual(session);
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('clears an expired stored session, signs out of Firebase and warns the user', async () => {
    const expiredSession = buildSession(Date.now() - (FIVE_MINUTES_MS + 1000));
    localStorage.setItem(SESSION_KEY, JSON.stringify(expiredSession));

    const { getCurrentSession } = await import('./auth-state');

    expect(getCurrentSession()).toBeUndefined();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(showSnackbarMock).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.',
      'error'
    );
  });

  it('clears invalid stored data silently, without the expiry warning', async () => {
    localStorage.setItem(SESSION_KEY, 'not-json');

    const { getCurrentSession } = await import('./auth-state');

    expect(getCurrentSession()).toBeUndefined();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(showSnackbarMock).not.toHaveBeenCalled();
  });

  it('notifies listeners when the session changes', async () => {
    const { setCurrentSession, onAuthStateChange } = await import('./auth-state');
    const listener = vi.fn();
    onAuthStateChange(listener);

    const session = buildSession(Date.now());
    setCurrentSession(session);

    expect(listener).toHaveBeenCalledWith(session);
  });

  it('signs the user out on re-check when the in-memory session has no backing in storage', async () => {
    const { getCurrentSession, setCurrentSession, checkSessionExpiration } =
      await import('./auth-state');
    setCurrentSession(buildSession(Date.now()));

    checkSessionExpiration();

    expect(getCurrentSession()).toBeUndefined();
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
