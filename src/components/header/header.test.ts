import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  signOutMock,
  navigateMock,
  getLocationMock,
  clearSessionMock,
  getCurrentSessionMock,
  onAuthStateChangeMock,
  setCurrentSessionMock,
  showSnackbarMock,
} = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  navigateMock: vi.fn(),
  getLocationMock: vi.fn(),
  clearSessionMock: vi.fn(),
  getCurrentSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(),
  setCurrentSessionMock: vi.fn(),
  showSnackbarMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({ signOut: signOutMock }));
vi.mock('../../firebase/firebase-config', () => ({ firebaseAuth: {} }));
vi.mock('../../app/router', () => ({ navigate: navigateMock, getLocation: getLocationMock }));
vi.mock('../../app/session', () => ({ clearSession: clearSessionMock }));
vi.mock('../../app/auth-state', () => ({
  getCurrentSession: getCurrentSessionMock,
  onAuthStateChange: onAuthStateChangeMock,
  setCurrentSession: setCurrentSessionMock,
}));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));
// The mobile menu has its own tests, so here it is just an empty element.
vi.mock('../mobile-menu/mobile-menu', () => ({
  createMobileMenu: () => document.createElement('div'),
}));

import { createHeader } from './header';

const SESSION = {
  displayName: 'Forest Dweller',
  email: 'student@rs.school',
  authenticatedAt: Date.now(),
};

function mountHeader(): void {
  document.body.replaceChildren(createHeader());
}

function getButton(selector: string): HTMLButtonElement {
  return document.querySelector(selector) as HTMLButtonElement;
}

function getNavLink(label: string): HTMLAnchorElement {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.header__nav-link')];
  return links.find((link) => link.textContent === label) as HTMLAnchorElement;
}

describe('createHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocationMock.mockReturnValue({ path: '/' });
    getCurrentSessionMock.mockReturnValue(undefined);
    history.replaceState({}, '', '/');
  });

  describe('navigation', () => {
    it('marks the link of the current page as active', () => {
      getLocationMock.mockReturnValue({ path: '/library' });

      mountHeader();

      expect(getNavLink('Library').getAttribute('aria-current')).toBe('page');
      expect(getNavLink('Library').classList.contains('header__nav-link--active')).toBe(true);
      expect(getNavLink('Home').hasAttribute('aria-current')).toBe(false);
    });

    it('navigates inside the app instead of reloading the page', () => {
      mountHeader();
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });

      getNavLink('Library').dispatchEvent(click);

      expect(click.defaultPrevented).toBe(true);
      expect(navigateMock).toHaveBeenCalledWith('/library');
    });
  });

  describe('as a guest', () => {
    it('shows Log In and Sign Up that open the auth dialog through the URL', () => {
      mountHeader();

      getButton('[data-auth-trigger="login"]').click();
      expect(navigateMock).toHaveBeenCalledWith('/?auth=login');

      getButton('[data-auth-trigger="register"]').click();
      expect(navigateMock).toHaveBeenCalledWith('/?auth=register');

      expect(document.querySelector('[data-logout]')).toBeNull();
    });
  });

  describe('when signed in', () => {
    beforeEach(() => {
      getCurrentSessionMock.mockReturnValue(SESSION);
    });

    it('shows the profile name and a Log Out button', () => {
      mountHeader();

      expect(document.querySelector('[data-profile-name]')?.textContent).toBe('Forest Dweller');
      expect(document.querySelector('[data-avatar-initials]')?.textContent).toBe('FD');
      expect(document.querySelector('[data-auth-trigger]')).toBeNull();
    });

    it('logs out, clears the session and confirms it', async () => {
      signOutMock.mockResolvedValue(undefined);
      mountHeader();

      getButton('[data-logout]').click();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith("You've been logged out.", 'success')
      );
      expect(clearSessionMock).toHaveBeenCalled();
      expect(setCurrentSessionMock).toHaveBeenCalledWith(undefined);
    });

    it('still switches to guest mode when Firebase sign-out fails', async () => {
      signOutMock.mockRejectedValue(new Error('Network error'));
      mountHeader();

      getButton('[data-logout]').click();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Sign-out failed, but you have been switched to Guest Mode.',
          'error'
        )
      );
      expect(clearSessionMock).toHaveBeenCalled();
      expect(setCurrentSessionMock).toHaveBeenCalledWith(undefined);
    });
  });

  it('redraws the auth buttons when the auth state changes', () => {
    mountHeader();
    const listener = onAuthStateChangeMock.mock.lastCall?.[0] as () => void;

    getCurrentSessionMock.mockReturnValue(SESSION);
    listener();

    expect(document.querySelector('[data-logout]')).not.toBeNull();
    expect(document.querySelector('[data-auth-trigger]')).toBeNull();
  });
});
