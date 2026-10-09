import starIcon from '../../../assets/icons/star-icon.svg';
import favoriteIcon from '../../../assets/icons/favorite-icon.svg';
import heartOutlineIcon from '../../../assets/icons/fav-icon.svg';
import { runProtectedAction } from '../../../app/protected-action';
import { onAuthStateChange, getCurrentSession } from '../../../app/auth-state';
import { showSnackbar } from '../../snackbar/snackbar';
import { toggleGameFavorite, formatLikes } from '../game-details-dialog.data';
import type { GameDetails, GameInfoItem } from '../game-details-dialog.data';

export const GAME_TITLE_ID = 'game-details-title';

const FAVORITE_BUTTON_SELECTOR = '.game-details-dialog__favorite';
const LIKES_STAT_SELECTOR = '.game-details-dialog__stat-likes';
const FAVORITE_LABEL_ADD = 'Add to Favorites';
const FAVORITE_LABEL_REMOVE = 'Remove from Favorites';
const GUEST_FAVORITE_MESSAGE = 'Log in to add games to your favorites.';
const FAVORITE_ERROR_MESSAGE = 'Could not update favorites. Please try again.';

function createInfoItem({ label, value }: GameInfoItem): string {
  return `
    <li class="game-details-dialog__info-item">
      <span class="game-details-dialog__info-label">${label}</span>
      <span class="game-details-dialog__info-value">${value}</span>
    </li>
  `;
}

function setFavoriteState(button: HTMLButtonElement, isPressed: boolean): void {
  const label = isPressed ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD;

  button.setAttribute('aria-pressed', String(isPressed));
  button.setAttribute('aria-label', label);

  const labelElement = button.querySelector('.game-details-dialog__favorite-label');

  if (labelElement) {
    labelElement.textContent = label;
  }
}

function setLikesCount(likesStat: HTMLElement | null, likesCount: number): void {
  if (likesStat) {
    likesStat.textContent = formatLikes(likesCount);
  }
}

async function toggleFavorite(
  button: HTMLButtonElement,
  likesStat: HTMLElement | null,
  slug: string
): Promise<void> {
  if (button.disabled) {
    return;
  }

  const userEmail = getCurrentSession()?.email;

  if (!userEmail) {
    return;
  }

  button.disabled = true;

  try {
    const result = await toggleGameFavorite(slug, userEmail);
    setFavoriteState(button, result.isFavorited);
    setLikesCount(likesStat, result.likesCount);
  } catch {
    showSnackbar(FAVORITE_ERROR_MESSAGE, 'error');
  } finally {
    button.disabled = false;
  }
}

function createFavoriteResetRegistrar(): () => void {
  let hasRegistered = false;

  return function registerFavoriteResetOnLogout(): void {
    if (hasRegistered) {
      return;
    }

    hasRegistered = true;

    onAuthStateChange((session) => {
      if (session) {
        return;
      }

      const favoriteButton = document.querySelector<HTMLButtonElement>(FAVORITE_BUTTON_SELECTOR);

      if (favoriteButton) {
        setFavoriteState(favoriteButton, false);
      }
    });
  };
}

const registerFavoriteResetOnLogout = createFavoriteResetRegistrar();

export function createGameInfo(game: GameDetails, slug: string): DocumentFragment {
  registerFavoriteResetOnLogout();

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
          <span class="game-details-dialog__stat-likes">${game.likes}</span>
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
        aria-pressed="${game.isFavorited}"
        aria-label="${game.isFavorited ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD}"
      >
        <img class="game-details-dialog__heart" src="${heartOutlineIcon}" alt="" />
        <span class="game-details-dialog__favorite-label">${
          game.isFavorited ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD
        }</span>
      </button>
    </div>
  `;

  const favoriteButton =
    template.content.querySelector<HTMLButtonElement>(FAVORITE_BUTTON_SELECTOR);
  const likesStat = template.content.querySelector<HTMLElement>(LIKES_STAT_SELECTOR);

  favoriteButton?.addEventListener('click', () => {
    runProtectedAction(() => {
      void toggleFavorite(favoriteButton, likesStat, slug);
    }, GUEST_FAVORITE_MESSAGE);
  });

  return template.content;
}
