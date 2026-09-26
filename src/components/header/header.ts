import './header.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import burgerIcon from '../../assets/icons/burger-icon.svg';
import { createMobileMenu } from '../mobile-menu/mobile-menu';
import { openAuthDialog } from '../auth-dialog/auth-dialog';
import { navigateTo } from '../../app/router';
import { navItems, getCurrentPage } from './nav-items';

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
          <button class="header__btn header__btn--outline" type="button">Log In</button>
          <button class="header__btn header__btn--accent" type="button">Sign Up</button>
          <button class="header__burger" type="button" aria-label="Open menu">
            <img src="${burgerIcon}" alt="" />
          </button>
        </div>
      </div>
    </div>
  `;

  const navLinks = header.querySelectorAll<HTMLAnchorElement>('.header__nav-link, .header__logo');
  for (const link of navLinks) {
    link.addEventListener('click', handleNavClick);
  }

  const signInButtons = header.querySelectorAll('.header__btn--outline, .header__btn--accent');
  for (const button of signInButtons) {
    button.addEventListener('click', handleAuthTrigger);
  }

  const burger = header.querySelector<HTMLButtonElement>('.header__burger');
  if (burger) {
    header.append(createMobileMenu(burger));
  }

  return header;
}

function handleNavClick(event: MouseEvent): void {
  event.preventDefault();
  const link = event.currentTarget as HTMLAnchorElement;
  const href = link.getAttribute('href') ?? '/';
  navigateTo(href);
}

function handleAuthTrigger(): void {
  openAuthDialog();
}
