import './mobile-menu.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import closeIcon from '../../assets/icons/close-button-icon.svg';
import { signOut } from 'firebase/auth';
import { navigate } from '../../app/router';
import { withAuthParameter } from '../../app/dialog-urls';
import { navItems, getCurrentPage } from '../header/nav-items';
import { firebaseAuth } from '../../firebase/firebase-config';
import { clearSession } from '../../app/session';
import { getCurrentSession, onAuthStateChange, setCurrentSession } from '../../app/auth-state';
import { showSnackbar } from '../snackbar/snackbar';

const OPEN_CLASS = 'mobile-menu--open';
const NO_SCROLL_CLASS = 'no-scroll';

function renderNavLinks(): string {
  const currentPage = getCurrentPage();
  return navItems
    .map((item) => {
      const isActive = item.page !== undefined && item.page === currentPage;
      const activeClass = isActive ? ' mobile-menu__link--active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return `<li><a class="mobile-menu__link${activeClass}" href="${item.href}"${ariaCurrent}>${item.label}</a></li>`;
    })
    .join('');
}

function renderAuthActions(): string {
  const session = getCurrentSession();

  return session
    ? `
      <span class="mobile-menu__user">Hi, ${session.displayName}</span>
      <button class="mobile-menu__btn mobile-menu__btn--outline" type="button" data-logout>Log Out</button>
    `
    : `
      <button class="mobile-menu__btn mobile-menu__btn--outline" type="button" data-auth-trigger="login">Log In</button>
      <button class="mobile-menu__btn mobile-menu__btn--accent" type="button" data-auth-trigger="register">Sign Up</button>
    `;
}

export function createMobileMenu(trigger: HTMLElement): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobile-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Navigation menu');
  menu.innerHTML = `
    <div class="mobile-menu__top">
      <a class="mobile-menu__logo" href="/">
        <img class="mobile-menu__logo-icon" src="${logoIcon}" alt="" />
        <span>MiniGames</span>
      </a>
      <button class="mobile-menu__close" type="button" aria-label="Close menu">
        <img class="mobile-menu__close-icon" src="${closeIcon}" alt="" />
      </button>
    </div>

    <nav class="mobile-menu__nav" aria-label="Mobile navigation">
      <ul class="mobile-menu__list">
        ${renderNavLinks()}
      </ul>
    </nav>

    <div class="mobile-menu__actions">
      ${renderAuthActions()}
    </div>
  `;

  trigger.setAttribute('aria-controls', menu.id);
  trigger.setAttribute('aria-expanded', 'false');

  const closeButton = menu.querySelector<HTMLButtonElement>(':scope .mobile-menu__close');
  const actions = menu.querySelector<HTMLElement>(':scope .mobile-menu__actions');

  function isMenuAvailable(): boolean {
    return getComputedStyle(menu).display !== 'none';
  }

  function openMenu(): void {
    if (!isMenuAvailable()) {
      return;
    }
    menu.classList.add(OPEN_CLASS);
    document.body.classList.add(NO_SCROLL_CLASS);
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);
    closeButton?.focus();
  }

  function closeMenu(): void {
    menu.classList.remove(OPEN_CLASS);
    document.body.classList.remove(NO_SCROLL_CLASS);
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
    trigger.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeMenu();
    }
  }

  function handleResize(): void {
    if (!isMenuAvailable()) {
      closeMenu();
    }
  }

  function handleAuthTrigger(mode: 'login' | 'register'): void {
    closeMenu();
    navigate(withAuthParameter(mode));
  }

  async function handleLogout(): Promise<void> {
    closeMenu();

    try {
      await signOut(firebaseAuth);
    } catch {
      // Local session is cleared regardless of whether the Firebase call succeeds.
    }

    clearSession();
    setCurrentSession(undefined);
    showSnackbar("You've been logged out.", 'success');
  }

  function bindAuthActions(container: HTMLElement): void {
    container
      .querySelector<HTMLButtonElement>(':scope [data-auth-trigger="login"]')
      ?.addEventListener('click', () => handleAuthTrigger('login'));
    container
      .querySelector<HTMLButtonElement>(':scope [data-auth-trigger="register"]')
      ?.addEventListener('click', () => handleAuthTrigger('register'));
    container
      .querySelector<HTMLButtonElement>(':scope [data-logout]')
      ?.addEventListener('click', () => {
        void handleLogout();
      });
  }

  function handleNavLinkClick(event: MouseEvent): void {
    event.preventDefault();
    const link = event.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href') ?? '/';
    closeMenu();
    navigate(href);
  }

  trigger.addEventListener('click', openMenu);
  closeButton?.addEventListener('click', closeMenu);

  const links = menu.querySelectorAll<HTMLAnchorElement>(
    ':scope .mobile-menu__logo, :scope .mobile-menu__link'
  );
  for (const link of links) {
    link.addEventListener('click', handleNavLinkClick);
  }

  if (actions) {
    bindAuthActions(actions);
  }

  onAuthStateChange(() => {
    if (!actions) {
      return;
    }

    actions.innerHTML = renderAuthActions();
    bindAuthActions(actions);
  });

  return menu;
}
