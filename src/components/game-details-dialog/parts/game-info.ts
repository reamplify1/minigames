import starIcon from '../../../assets/icons/star-icon.svg';
import favoriteIcon from '../../../assets/icons/favorite-icon.svg';
import heartOutlineIcon from '../../../assets/icons/fav-icon.svg';
import type { GameDetails, GameInfoItem } from '../game-details-dialog.data';

export const GAME_TITLE_ID = 'game-details-title';

const FAVORITE_LABEL_ADD = 'Add to Favorites';
const FAVORITE_LABEL_REMOVE = 'Remove from Favorites';

function createInfoItem({ label, value }: GameInfoItem): string {
  return `
    <li class="game-details-dialog__info-item">
      <span class="game-details-dialog__info-label">${label}</span>
      <span class="game-details-dialog__info-value">${value}</span>
    </li>
  `;
}

function toggleFavorite(button: HTMLButtonElement): void {
  const isPressed = button.getAttribute('aria-pressed') !== 'true';
  const label = isPressed ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD;

  button.setAttribute('aria-pressed', String(isPressed));
  button.setAttribute('aria-label', label);

  const labelElement = button.querySelector('.game-details-dialog__favorite-label');

  if (labelElement) {
    labelElement.textContent = label;
  }
}

// Returns several sibling elements at once (title row, description, badges, buttons),
// so it uses a <template> and gives back its content.
export function createGameInfo(game: GameDetails): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="game-details-dialog__title-row">
      <h2 class="game-details-dialog__title" id="${GAME_TITLE_ID}">${game.title}</h2>
      <div class="game-details-dialog__stats">
        <span class="game-details-dialog__stat">
          <img class="game-details-dialog__stat-icon" src="${starIcon}" alt="Rating" />
          ${game.rating}
        </span>
        <span class="game-details-dialog__stat">
          <img class="game-details-dialog__stat-icon" src="${favoriteIcon}" alt="Likes" />
          ${game.likes}
        </span>
      </div>
    </div>

    <p class="game-details-dialog__description">${game.description}</p>

    <ul class="game-details-dialog__info">
      ${game.info.map((item) => createInfoItem(item)).join('')}
    </ul>

    <div class="game-details-dialog__actions">
      <button class="game-details-dialog__play" type="button">Play Now</button>
      <button
        class="game-details-dialog__favorite"
        type="button"
        aria-pressed="false"
        aria-label="${FAVORITE_LABEL_ADD}"
      >
        <img class="game-details-dialog__heart" src="${heartOutlineIcon}" alt="" />
        <span class="game-details-dialog__favorite-label">${FAVORITE_LABEL_ADD}</span>
      </button>
    </div>
  `;

  const favoriteButton = template.content.querySelector<HTMLButtonElement>(
    '.game-details-dialog__favorite'
  );

  favoriteButton?.addEventListener('click', () => {
    toggleFavorite(favoriteButton);
  });

  return template.content;
}
