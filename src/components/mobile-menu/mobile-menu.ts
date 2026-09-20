import './mobile-menu.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import closeIcon from '../../assets/icons/close-button-icon.svg';
import { openAuthDialog } from '../auth-dialog/auth-dialog';

const OPEN_CLASS = 'mobile-menu--open';
const NO_SCROLL_CLASS = 'no-scroll';

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
        <img class="mobile-menu__logo-icon" src="${logoIcon}" alt="logo icon" />
        <span>MiniGames</span>
      </a>
      <button class="mobile-menu__close" type="button" aria-label="Close menu">
        <img class="mobile-menu__close-icon" src="${closeIcon}" alt="close button" />
      </button>
    </div>

    <nav class="mobile-menu__nav" aria-label="Mobile navigation">
      <ul class="mobile-menu__list">
        <li><a class="mobile-menu__link mobile-menu__link--active" href="/">Home</a></li>
        <li><a class="mobile-menu__link" href="/">Library</a></li>
        <li><a class="mobile-menu__link" href="/">Tournaments</a></li>
        <li><a class="mobile-menu__link" href="/">Community</a></li>
      </ul>
    </nav>

    <div class="mobile-menu__actions">
      <button class="mobile-menu__btn mobile-menu__btn--outline" type="button">Log In</button>
      <button class="mobile-menu__btn mobile-menu__btn--accent" type="button">Sign Up</button>
    </div>
  `;

  trigger.setAttribute('aria-controls', menu.id);
  trigger.setAttribute('aria-expanded', 'false');

  const closeButton = menu.querySelector<HTMLButtonElement>('.mobile-menu__close');

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

  function handleAuthTrigger(): void {
    closeMenu();
    openAuthDialog();
  }

  trigger.addEventListener('click', openMenu);
  closeButton?.addEventListener('click', closeMenu);

  const links = menu.querySelectorAll('.mobile-menu__logo, .mobile-menu__link');
  for (const link of links) {
    link.addEventListener('click', closeMenu);
  }

  const authButtons = menu.querySelectorAll('.mobile-menu__btn');
  for (const button of authButtons) {
    button.addEventListener('click', handleAuthTrigger);
  }

  return menu;
}