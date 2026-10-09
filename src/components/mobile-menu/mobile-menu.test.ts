import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

import { createMobileMenu } from './mobile-menu';

const SESSION = {
  displayName: 'Forest Dweller',
  email: 'student@rs.school',
  authenticatedAt: Date.now(),
};

interface MountedMenu {
  trigger: HTMLButtonElement;
  menu: HTMLElement;
}

function mountMenu(): MountedMenu {
  const trigger = document.createElement('button');
  const menu = createMobileMenu(trigger);
  document.body.replaceChildren(trigger, menu);
  return { trigger, menu };
}

function isOpen(menu: HTMLElement): boolean {
  return menu.classList.contains('mobile-menu--open');
}

// On desktop the menu is hidden with CSS (display: none) and must not open.
function pretendMenuIsHiddenByCss(): void {
  const hiddenStyle = { display: 'none' };
  vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
    hiddenStyle as unknown as CSSStyleDeclaration
  );
}

function getButton(selector: string): HTMLButtonElement {
  return document.querySelector(selector) as HTMLButtonElement;
}

describe('createMobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocationMock.mockReturnValue({ path: '/' });
    getCurrentSessionMock.mockReturnValue(undefined);
    history.replaceState({}, '', '/');
    document.body.classList.remove('no-scroll');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('opening and closing', () => {
    it('connects the burger button to the menu', () => {
      const { trigger } = mountMenu();

      expect(trigger.getAttribute('aria-controls')).toBe('mobile-menu');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens on the burger click and locks page scrolling', () => {
      const { trigger, menu } = mountMenu();

      trigger.click();

      expect(isOpen(menu)).toBe(true);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(document.body.classList.contains('no-scroll')).toBe(true);
    });

    it('closes with the close button and unlocks page scrolling', () => {
      const { trigger, menu } = mountMenu();
      trigger.click();

      getButton('.mobile-menu__close').click();

      expect(isOpen(menu)).toBe(false);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.classList.contains('no-scroll')).toBe(false);
    });

    it('closes with the Escape key', () => {
      const { trigger, menu } = mountMenu();
      trigger.click();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(isOpen(menu)).toBe(true);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(isOpen(menu)).toBe(false);
    });

    it('does not open when the menu is hidden by CSS on a wide screen', () => {
      const { trigger, menu } = mountMenu();
      pretendMenuIsHiddenByCss();

      trigger.click();

      expect(isOpen(menu)).toBe(false);
    });

    it('closes when the window is resized to a wide screen', () => {
      const { trigger, menu } = mountMenu();
      trigger.click();

      globalThis.dispatchEvent(new Event('resize'));
      expect(isOpen(menu)).toBe(true);

      pretendMenuIsHiddenByCss();
      globalThis.dispatchEvent(new Event('resize'));
      expect(isOpen(menu)).toBe(false);
    });
  });

  describe('links and auth buttons', () => {
    it('marks the current page link as active', () => {
      getLocationMock.mockReturnValue({ path: '/library' });

      mountMenu();

      const active = document.querySelector('.mobile-menu__link--active');
      expect(active?.textContent).toBe('Library');
      expect(active?.getAttribute('aria-current')).toBe('page');
    });

    it('closes and navigates inside the app when a link is clicked', () => {
      const { trigger, menu } = mountMenu();
      trigger.click();
      const libraryLink = document.querySelector('.mobile-menu__link[href="/library"]');
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });

      libraryLink?.dispatchEvent(click);

      expect(click.defaultPrevented).toBe(true);
      expect(isOpen(menu)).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith('/library');
    });

    it('closes and opens the auth dialog for Log In and Sign Up', () => {
      const { trigger, menu } = mountMenu();
      trigger.click();

      getButton('[data-auth-trigger="login"]').click();
      expect(isOpen(menu)).toBe(false);
      expect(navigateMock).toHaveBeenCalledWith('/?auth=login');

      getButton('[data-auth-trigger="register"]').click();
      expect(navigateMock).toHaveBeenCalledWith('/?auth=register');
    });
  });

  describe('when signed in', () => {
    beforeEach(() => {
      getCurrentSessionMock.mockReturnValue(SESSION);
    });

    it('shows the profile name instead of the auth buttons', () => {
      mountMenu();

      expect(document.querySelector('[data-profile-name]')?.textContent).toBe('Forest Dweller');
      expect(document.querySelector('[data-auth-trigger]')).toBeNull();
    });

    it('closes, logs out and confirms it', async () => {
      signOutMock.mockResolvedValue(undefined);
      const { trigger, menu } = mountMenu();
      trigger.click();

      getButton('[data-logout]').click();

      expect(isOpen(menu)).toBe(false);
      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith("You've been logged out.", 'success')
      );
      expect(clearSessionMock).toHaveBeenCalled();
      expect(setCurrentSessionMock).toHaveBeenCalledWith(undefined);
    });

    it('still switches to guest mode when Firebase sign-out fails', async () => {
      signOutMock.mockRejectedValue(new Error('Network error'));
      mountMenu();

      getButton('[data-logout]').click();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Sign-out failed, but you have been switched to Guest Mode.',
          'error'
        )
      );
      expect(clearSessionMock).toHaveBeenCalled();
    });
  });

  it('redraws the auth buttons when the auth state changes', () => {
    mountMenu();
    const listener = onAuthStateChangeMock.mock.lastCall?.[0] as () => void;

    getCurrentSessionMock.mockReturnValue(SESSION);
    listener();

    expect(document.querySelector('[data-logout]')).not.toBeNull();
  });
});
