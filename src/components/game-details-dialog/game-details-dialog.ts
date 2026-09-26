import './game-details-dialog.scss';
import heroImage from '../../assets/images/games/tukoni-forest-keepers.jpg';
import closeIcon from '../../assets/icons/close-blue-icon.svg';
import starIcon from '../../assets/icons/star-icon.svg';
import favoriteIcon from '../../assets/icons/favorite-icon.svg';
import heartOutlineIcon from '../../assets/icons/fav-icon.svg';
import sendIcon from '../../assets/icons/send-icon.svg';
import {
  MOCK_GAME_DETAILS,
  type GameComment,
  type GameInfoItem,
  type GameRecord,
} from './game-details-dialog.data';

const DIALOG_SELECTOR = '.game-details-dialog';
const CLOSE_SELECTOR = '[data-dialog-close]';
const FAVORITE_SELECTOR = '[data-favorite-toggle]';
const LIKE_SELECTOR = '[data-comment-like]';
const COMMENT_INPUT_SELECTOR = '[data-comment-input]';
const COMMENT_SUBMIT_SELECTOR = '[data-comment-submit]';
const COMMENT_FORM_SELECTOR = '[data-comment-form]';

const TITLE_ID = 'game-details-title';
const RECORDS_TITLE_ID = 'game-details-records-title';
const COMMENTS_TITLE_ID = 'game-details-comments-title';
const COMMENT_INPUT_ID = 'game-details-comment-input';

const FAVORITE_LABEL_ADD = 'Add to Favorites';
const FAVORITE_LABEL_REMOVE = 'Remove from Favorites';

const COMMENT_INPUT_MAX_HEIGHT = 88;

const RECORD_MEDALS = ['🥇', '🥈', '🥉'] as const;

function createInfoItem({ label, value }: GameInfoItem): string {
  return `
    <li class="game-details-dialog__info-item">
      <span class="game-details-dialog__info-label">${label}</span>
      <span class="game-details-dialog__info-value">${value}</span>
    </li>
  `;
}

function createRecordItem({ player, score, date }: GameRecord, index: number): string {
  const medal = RECORD_MEDALS[index] ?? '';

  return `
    <li class="game-details-dialog__record">
      <span class="game-details-dialog__record-player">
        <span class="game-details-dialog__record-medal" aria-hidden="true">${medal}</span>
        <span class="game-details-dialog__record-name">${player}</span>
      </span>
      <span class="game-details-dialog__record-result">
        <span class="game-details-dialog__record-score">${score}</span>
        <span class="game-details-dialog__record-date">${date}</span>
      </span>
    </li>
  `;
}

function createRecordsSection(records: GameRecord[]): string {
  return `
    <section class="game-details-dialog__records" aria-labelledby="${RECORDS_TITLE_ID}">
      <h3 class="game-details-dialog__records-title" id="${RECORDS_TITLE_ID}">
        <span class="game-details-dialog__records-icon" aria-hidden="true">🏆</span>
        Top Records
      </h3>
      <ol class="game-details-dialog__records-list">
        ${records.map((record, index) => createRecordItem(record, index)).join('')}
      </ol>
    </section>
  `;
}

function createCommentItem({
  author,
  date,
  text,
  likes,
  isLiked,
  avatarColor,
}: GameComment): string {
  return `
    <li>
      <article class="game-details-dialog__comment">
        <header class="game-details-dialog__comment-header">
          <span class="game-details-dialog__comment-author">
            <span
              class="game-details-dialog__comment-avatar game-details-dialog__comment-avatar--${avatarColor}"
              aria-hidden="true"
            >${author.charAt(0)}</span>
            <span class="game-details-dialog__comment-name">${author}</span>
          </span>
          <span class="game-details-dialog__comment-date">${date}</span>
        </header>
        <p class="game-details-dialog__comment-text">${text}</p>
        <footer class="game-details-dialog__comment-footer">
          <button
            class="game-details-dialog__like"
            type="button"
            aria-pressed="${isLiked}"
            aria-label="Like comment by ${author}, ${likes} likes"
            data-comment-like
          >
            <img class="game-details-dialog__like-icon" src="${heartOutlineIcon}" alt="" />
            <span class="game-details-dialog__like-count">${likes}</span>
          </button>
        </footer>
      </article>
    </li>
  `;
}

function createCommentsSection(comments: GameComment[]): string {
  return `
    <section class="game-details-dialog__comments" aria-labelledby="${COMMENTS_TITLE_ID}">
      <h3 class="game-details-dialog__comments-title" id="${COMMENTS_TITLE_ID}">
        Comments (${comments.length})
      </h3>

      <form class="game-details-dialog__comment-form" data-comment-form>
        <span class="game-details-dialog__user-avatar" aria-hidden="true">U</span>
        <label class="game-details-dialog__comment-label" for="${COMMENT_INPUT_ID}">
          Write a comment
        </label>
        <textarea
          class="game-details-dialog__comment-input"
          id="${COMMENT_INPUT_ID}"
          name="comment"
          rows="1"
          placeholder="Write a comment..."
          data-comment-input
        ></textarea>
        <button
          class="game-details-dialog__comment-submit"
          type="submit"
          aria-label="Submit comment"
          disabled
          data-comment-submit
        >
          <img class="game-details-dialog__comment-submit-icon" src="${sendIcon}" alt="" />
        </button>
      </form>

      <ul class="game-details-dialog__comments-list">
        ${comments.map((comment) => createCommentItem(comment)).join('')}
      </ul>
    </section>
  `;
}

function createDialogContent(): string {
  const game = MOCK_GAME_DETAILS;

  return `
    <div class="game-details-dialog__content">
      <header class="game-details-dialog__hero">
        <img
          class="game-details-dialog__hero-image"
          src="${heroImage}"
          alt="${game.title} artwork"
        />
        <button
          class="game-details-dialog__close"
          type="button"
          aria-label="Close dialog"
          data-dialog-close
        >
          <img class="game-details-dialog__close-icon" src="${closeIcon}" alt="" />
        </button>
      </header>

      <div class="game-details-dialog__body">
        <div class="game-details-dialog__title-row">
          <h2 class="game-details-dialog__title" id="${TITLE_ID}">${game.title}</h2>
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
            data-favorite-toggle
          >
            <img class="game-details-dialog__heart" src="${heartOutlineIcon}" alt="" />
            <span class="game-details-dialog__favorite-label">${FAVORITE_LABEL_ADD}</span>
          </button>
        </div>

        ${createRecordsSection(game.records)}

        ${createCommentsSection(game.comments)}
      </div>
    </div>
  `;
}

function toggleFavorite(button: HTMLButtonElement): void {
  const isPressed = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(isPressed));

  const label = isPressed ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD;
  button.setAttribute('aria-label', label);

  const labelElement = button.querySelector('.game-details-dialog__favorite-label');

  if (labelElement) {
    labelElement.textContent = label;
  }
}

function toggleLike(button: HTMLButtonElement): void {
  const isPressed = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(isPressed));
}

function resizeCommentInput(textarea: HTMLTextAreaElement): void {
  textarea.style.height = 'auto';

  const { borderTopWidth, borderBottomWidth } = getComputedStyle(textarea);
  const borders = Number(borderTopWidth) + Number(borderBottomWidth);
  const contentHeight = textarea.scrollHeight + borders;

  textarea.style.height = `${Math.min(contentHeight, COMMENT_INPUT_MAX_HEIGHT)}px`;
  textarea.style.overflowY = contentHeight > COMMENT_INPUT_MAX_HEIGHT ? 'auto' : 'hidden';
}

function updateCommentSubmit(textarea: HTMLTextAreaElement): void {
  const submitButton = textarea.form?.querySelector<HTMLButtonElement>(COMMENT_SUBMIT_SELECTOR);

  if (submitButton) {
    submitButton.disabled = textarea.value.trim() === '';
  }
}

function createGameDetailsDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-details-dialog';
  dialog.setAttribute('aria-labelledby', TITLE_ID);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(CLOSE_SELECTOR)) {
      dialog.close();
      return;
    }

    const likeButton = event.target.closest<HTMLButtonElement>(LIKE_SELECTOR);

    if (likeButton) {
      toggleLike(likeButton);
      return;
    }

    const favoriteButton = event.target.closest<HTMLButtonElement>(FAVORITE_SELECTOR);

    if (favoriteButton) {
      toggleFavorite(favoriteButton);
    }
  });

  dialog.addEventListener('input', (event) => {
    if (
      !(event.target instanceof HTMLTextAreaElement) ||
      !event.target.matches(COMMENT_INPUT_SELECTOR)
    ) {
      return;
    }

    resizeCommentInput(event.target);
    updateCommentSubmit(event.target);
  });

  dialog.addEventListener('submit', (event) => {
    if (event.target instanceof Element && event.target.matches(COMMENT_FORM_SELECTOR)) {
      event.preventDefault();
    }
  });

  return dialog;
}

function getGameDetailsDialog(): HTMLDialogElement {
  const existingDialog = document.querySelector<HTMLDialogElement>(DIALOG_SELECTOR);

  if (existingDialog) {
    return existingDialog;
  }

  const dialog = createGameDetailsDialog();
  document.body.append(dialog);

  return dialog;
}

export function openGameDetailsDialog(): void {
  const dialog = getGameDetailsDialog();

  if (dialog.open) {
    return;
  }

  dialog.innerHTML = createDialogContent();
  dialog.showModal();
  dialog.scrollTop = 0;
}
