import './header.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import burgerIcon from '../../assets/icons/burger-icon.svg';

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
            <li><a class="header__nav-link header__nav-link--active" href="/">Home</a></li>
            <li><a class="header__nav-link" href="/">Library</a></li>
            <li><a class="header__nav-link" href="/">Tournaments</a></li>
            <li><a class="header__nav-link" href="/">Community</a></li>
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

  const signInButtons = header.querySelectorAll('.header__btn--outline, .header__btn--accent');
  for (const button of signInButtons) {
    button.addEventListener('click', handleAuthTrigger);
  }

  return header;
}

function handleAuthTrigger(): void {
  // TODO: open Auth dialog
}