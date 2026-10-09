import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RouteContext } from './router';

const {
  onLocationChangeMock,
  navigateMock,
  checkSessionExpirationMock,
  getCurrentSessionMock,
  showSnackbarMock,
  openGameDetailsDialogMock,
  closeGameDetailsDialogMock,
  openAuthDialogMock,
  closeAuthDialogMock,
} = vi.hoisted(() => ({
  onLocationChangeMock: vi.fn(),
  navigateMock: vi.fn(),
  checkSessionExpirationMock: vi.fn(),
  getCurrentSessionMock: vi.fn(),
  showSnackbarMock: vi.fn(),
  openGameDetailsDialogMock: vi.fn(),
  closeGameDetailsDialogMock: vi.fn(),
  openAuthDialogMock: vi.fn(),
  closeAuthDialogMock: vi.fn(),
}));

vi.mock('./router', () => ({ onLocationChange: onLocationChangeMock, navigate: navigateMock }));
vi.mock('./auth-state', () => ({
  checkSessionExpiration: checkSessionExpirationMock,
  getCurrentSession: getCurrentSessionMock,
}));
vi.mock('../components/snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));
vi.mock('../components/game-details-dialog/game-details-dialog', () => ({
  openGameDetailsDialog: openGameDetailsDialogMock,
  closeGameDetailsDialog: closeGameDetailsDialogMock,
}));
vi.mock('../components/auth-dialog/auth-dialog', async () => {
  const actual = await vi.importActual<typeof import('../components/auth-dialog/auth-dialog')>(
    '../components/auth-dialog/auth-dialog'
  );
  return { ...actual, openAuthDialog: openAuthDialogMock, closeAuthDialog: closeAuthDialogMock };
});
vi.mock('../firebase/firebase-config', () => ({ firebaseAuth: {} }));

import { initDialogSync } from './dialog-sync';

// initDialogSync() registers a listener on the router. We grab that listener
// and call it ourselves with the URL we want to test.
function syncWithUrl(search: string): void {
  initDialogSync();
  const listener = onLocationChangeMock.mock.lastCall?.[0] as (context: RouteContext) => void;
  listener({ path: '/', searchParams: new URLSearchParams(search) });
}

describe('initDialogSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    history.replaceState({}, '', '/');
  });

  it('opens the auth dialog for a guest and hides game details', () => {
    getCurrentSessionMock.mockReturnValue(undefined);

    syncWithUrl('?auth=register&game=cozy-solitaire');

    expect(checkSessionExpirationMock).toHaveBeenCalled();
    expect(closeGameDetailsDialogMock).toHaveBeenCalled();
    expect(openAuthDialogMock).toHaveBeenCalledWith('register');
    expect(openGameDetailsDialogMock).not.toHaveBeenCalled();
  });

  it('does not open auth for a signed-in user and removes the auth parameter', () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });

    syncWithUrl('?auth=login');

    expect(openAuthDialogMock).not.toHaveBeenCalled();
    expect(showSnackbarMock).toHaveBeenCalledWith("You're already signed in.", 'success');
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('opens game details when only the game parameter is present', () => {
    syncWithUrl('?game=cozy-solitaire');

    expect(closeAuthDialogMock).toHaveBeenCalled();
    expect(openGameDetailsDialogMock).toHaveBeenCalledWith('cozy-solitaire');
  });

  it('ignores an unknown auth mode and closes both dialogs when nothing is requested', () => {
    syncWithUrl('?auth=guest');

    expect(openAuthDialogMock).not.toHaveBeenCalled();
    expect(closeAuthDialogMock).toHaveBeenCalled();
    expect(closeGameDetailsDialogMock).toHaveBeenCalled();
  });
});
