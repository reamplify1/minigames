import './header.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import burgerIcon from '../../assets/icons/burger-icon.svg';
import userIcon from '../../assets/icons/user-icon.svg';
import { signOut } from 'firebase/auth';
import { createMobileMenu } from '../mobile-menu/mobile-menu';
import { navigate } from '../../app/router';
import { withAuthParameter } from '../../app/dialog-urls';
import { navItems, getCurrentPage } from './nav-items';
import { firebaseAuth } from '../../firebase/firebase-config';
import { clearSession } from '../../app/session';
import { getCurrentSession, onAuthStateChange, setCurrentSession } from '../../app/auth-state';
import { showSnackbar } from '../snackbar/snackbar';
import { renderProfileBadge, type ProfileBadgeElements } from '../../app/profile-display';

function renderNavLinks(): string {
  const currentPage = getCurrentPage();
  return navItems
    .map((item) => {
      const isActive = item.page !== undefined && item.page === currentPage;
      const activeClass = isActive ? ' header__nav-link--active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return `<li><a class="header__nav-link${activeClass}" href="${item.href}"${ariaCurrent}>${item.label}</a></li>`;
    })
    .join('');
}

function renderAuthActions(): string {
  const session = getCurrentSession();

  return session
    ? `
      <span class="header__profile">
        <span class="header__avatar">
          <img class="header__avatar-img" alt="" hidden data-avatar-img />
          <span class="header__avatar-initials" hidden data-avatar-initials></span>
          <img class="header__avatar-fallback" src="${userIcon}" alt="" hidden data-avatar-fallback />
        </span>
        <span class="header__user" data-profile-name></span>
      </span>
      <button class="header__btn header__btn--outline" type="button" data-logout>Log Out</button>
    `
    : `
      <button class="header__btn header__btn--outline" type="button" data-auth-trigger="login">Log In</button>
      <button class="header__btn header__btn--accent" type="button" data-auth-trigger="register">Sign Up</button>
    `;
}

function getProfileBadgeElements(container: HTMLElement): ProfileBadgeElements | undefined {
  const nameElement = container.querySelector<HTMLElement>(':scope [data-profile-name]');
  const avatarImage = container.querySelector<HTMLImageElement>(':scope [data-avatar-img]');
  const avatarInitials = container.querySelector<HTMLElement>(':scope [data-avatar-initials]');
  const avatarFallback = container.querySelector<HTMLElement>(':scope [data-avatar-fallback]');

  return nameElement && avatarImage && avatarInitials && avatarFallback
    ? { nameElement, avatarImage, avatarInitials, avatarFallback }
    : undefined;
}

const LOGOUT_SUCCESS_MESSAGE = "You've been logged out.";
const LOGOUT_ERROR_MESSAGE = 'Sign-out failed, but you have been switched to Guest Mode.';

async function handleLogout(): Promise<void> {
  let didSignOutFail = false;

  try {
    await signOut(firebaseAuth);
  } catch {
    didSignOutFail = true;
  }

  clearSession();
  setCurrentSession(undefined);

  showSnackbar(
    didSignOutFail ? LOGOUT_ERROR_MESSAGE : LOGOUT_SUCCESS_MESSAGE,
    didSignOutFail ? 'error' : 'success',
  );
}

function bindAuthActions(container: HTMLElement): void {
  container
    .querySelector<HTMLButtonElement>(':scope [data-auth-trigger="login"]')
    ?.addEventListener('click', () => handleAuthTrigger('login'));
  container
    .querySelector<HTMLButtonElement>(':scope [data-auth-trigger="register"]')
    ?.addEventListener('click', () => handleAuthTrigger('register'));
  container.querySelector<HTMLButtonElement>(':scope [data-logout]')?.addEventListener('click', () => {
    void handleLogout();
  });

  const session = getCurrentSession();
  const badgeElements = getProfileBadgeElements(container);

  if (session && badgeElements) {
    renderProfileBadge(badgeElements, session);
  }
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header__inner">
      <a class="header__logo" href="/">
        <img class="header__logo-icon" src="${logoIcon}" alt="" />
        <span class="header__logo-text">MiniGames</span>
      </a>

      <div class="header__right">
        <nav class="header__nav" aria-label="Main navigation">
          <ul class="header__nav-list">
            ${renderNavLinks()}
          </ul>
        </nav>

        <div class="header__actions">
          <div class="header__auth-actions">
            ${renderAuthActions()}
          </div>
          <button class="header__burger" type="button" aria-label="Open menu">
            <img src="${burgerIcon}" alt="" />
          </button>
        </div>
      </div>
    </div>
  `;

  const navLinks = header.querySelectorAll<HTMLAnchorElement>(
    ':scope .header__nav-link, :scope .header__logo',
  );
  for (const link of navLinks) {
    link.addEventListener('click', handleNavClick);
  }

  const authActions = header.querySelector<HTMLElement>(':scope .header__auth-actions');
  if (authActions) {
    bindAuthActions(authActions);
  }

  const burger = header.querySelector<HTMLButtonElement>(':scope .header__burger');
  if (burger) {
    header.append(createMobileMenu(burger));
  }

  onAuthStateChange(() => {
    const container = header.querySelector<HTMLElement>(':scope .header__auth-actions');

    if (!container) {
      return;
    }

    container.innerHTML = renderAuthActions();
    bindAuthActions(container);
  });

  return header;
}

function handleNavClick(event: MouseEvent): void {
  event.preventDefault();
  const link = event.currentTarget as HTMLAnchorElement;
  const href = link.getAttribute('href') ?? '/';
  navigate(href);
}

function handleAuthTrigger(mode: 'login' | 'register'): void {
  navigate(withAuthParameter(mode));
}