import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkSessionExpirationMock, getCurrentSessionMock, navigateMock, showSnackbarMock } =
  vi.hoisted(() => ({
    checkSessionExpirationMock: vi.fn(),
    getCurrentSessionMock: vi.fn(),
    navigateMock: vi.fn(),
    showSnackbarMock: vi.fn(),
  }));

vi.mock('./auth-state', () => ({
  checkSessionExpiration: checkSessionExpirationMock,
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock('./router', () => ({ navigate: navigateMock }));

vi.mock('../components/snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

import { runProtectedAction } from './protected-action';
import { withAuthParameter } from './dialog-urls';

describe('runProtectedAction', () => {
  beforeEach(() => {
    checkSessionExpirationMock.mockClear();
    getCurrentSessionMock.mockReset();
    navigateMock.mockClear();
    showSnackbarMock.mockClear();
    history.replaceState({}, '', '/library?game=demo-slug');
  });

  it('re-validates the session before deciding whether to run the action', () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });

    runProtectedAction(vi.fn());

    expect(checkSessionExpirationMock).toHaveBeenCalledTimes(1);
  });

  it('runs the action directly when a session is present', () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });
    const action = vi.fn();

    runProtectedAction(action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('redirects to the login auth URL instead of running the action for a guest', () => {
    getCurrentSessionMock.mockReturnValue(undefined);
    const action = vi.fn();

    runProtectedAction(action);

    expect(action).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(withAuthParameter('login'));
  });

  it('shows the guest message only when one is given', () => {
    getCurrentSessionMock.mockReturnValue(undefined);

    runProtectedAction(vi.fn());
    expect(showSnackbarMock).not.toHaveBeenCalled();

    runProtectedAction(vi.fn(), 'Log in to like comments.');
    expect(showSnackbarMock).toHaveBeenCalledWith('Log in to like comments.', 'error');
  });
});
