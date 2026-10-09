import heartOutlineIcon from '../../../assets/icons/fav-icon.svg';
import sendIcon from '../../../assets/icons/send-icon.svg';
import { fetchGameComments, postGameComment, type GameComment } from './game-comments.data';
import {
  createCommentsSkeleton,
  createCommentsErrorBanner,
  createCommentsEmptyState,
} from './game-comments.states';
import { showSnackbar } from '../../snackbar/snackbar';
import { runProtectedAction } from '../../../app/protected-action';
import { onAuthStateChange, getCurrentSession } from '../../../app/auth-state';
import { ApiNetworkError } from '../../../utils/api';

const COMMENTS_TITLE_ID = 'game-details-comments-title';
const COMMENT_INPUT_ID = 'game-details-comment-input';
const COMMENT_INPUT_MAX_HEIGHT = 88;
const COMMENT_MAX_LENGTH = 500;
const SKELETON_COUNT = 3;
const LIKE_BUTTON_SELECTOR = '.game-details-dialog__like';
const PRESSED_LIKE_BUTTON_SELECTOR = `${LIKE_BUTTON_SELECTOR}[aria-pressed="true"]`;

const COMMENT_LENGTH_ERROR_MESSAGE = 'Comment must be between 1 and 500 characters.';
const COMMENT_POST_ERROR_MESSAGE = 'Could not post your comment. Please try again.';
const COMMENT_POST_UNKNOWN_MESSAGE =
  "We couldn't confirm your comment was sent. Please check before trying again.";

const AVATAR_RANDOM_COLORS = ['blue', 'yellow', 'green', 'pink', 'lavender'] as const;
type AvatarColor = (typeof AVATAR_RANDOM_COLORS)[number];

function createAvatarColorPicker(): (author: string) => AvatarColor {
  const colorByAuthor = new Map<string, AvatarColor>();

  return (author: string): AvatarColor => {
    const existing = colorByAuthor.get(author);

    if (existing) {
      return existing;
    }

    const color =
      AVATAR_RANDOM_COLORS[Math.floor(Math.random() * AVATAR_RANDOM_COLORS.length)] ?? 'blue';
    colorByAuthor.set(author, color);

    return color;
  };
}

function createCommentItem(
  { author, date, text, likes, isLiked }: GameComment,
  avatarColor: AvatarColor
): HTMLElement {
  const item = document.createElement('li');

  const article = document.createElement('article');
  article.className = 'game-details-dialog__comment';

  const header = document.createElement('header');
  header.className = 'game-details-dialog__comment-header';

  const authorWrapper = document.createElement('span');
  authorWrapper.className = 'game-details-dialog__comment-author';

  const avatar = document.createElement('span');
  avatar.className = `game-details-dialog__comment-avatar game-details-dialog__comment-avatar--${avatarColor}`;
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = author.trim().charAt(0).toUpperCase();

  const name = document.createElement('span');
  name.className = 'game-details-dialog__comment-name';
  name.textContent = author;

  authorWrapper.append(avatar, name);

  const dateElement = document.createElement('span');
  dateElement.className = 'game-details-dialog__comment-date';
  dateElement.textContent = date;

  header.append(authorWrapper, dateElement);

  const textElement = document.createElement('p');
  textElement.className = 'game-details-dialog__comment-text';
  textElement.textContent = text;

  const footer = document.createElement('footer');
  footer.className = 'game-details-dialog__comment-footer';

  const likeButton = document.createElement('button');
  likeButton.className = 'game-details-dialog__like';
  likeButton.type = 'button';
  likeButton.setAttribute('aria-pressed', String(isLiked));
  likeButton.setAttribute('aria-label', `Like comment by ${author}, ${likes} likes`);

  const likeIcon = document.createElement('img');
  likeIcon.className = 'game-details-dialog__like-icon';
  likeIcon.src = heartOutlineIcon;
  likeIcon.alt = '';

  const likeCount = document.createElement('span');
  likeCount.className = 'game-details-dialog__like-count';
  likeCount.textContent = String(likes);

  likeButton.append(likeIcon, likeCount);
  footer.append(likeButton);

  article.append(header, textElement, footer);
  item.append(article);

  return item;
}

function parsePixels(value: string): number {
  return Number(value.replace('px', '')) || 0;
}

function resizeCommentInput(textarea: HTMLTextAreaElement): void {
  textarea.style.height = 'auto';

  const { borderTopWidth, borderBottomWidth } = getComputedStyle(textarea);
  const borders = parsePixels(borderTopWidth) + parsePixels(borderBottomWidth);
  const contentHeight = textarea.scrollHeight + borders;

  textarea.style.height = `${Math.min(contentHeight, COMMENT_INPUT_MAX_HEIGHT)}px`;
  textarea.style.overflowY = contentHeight > COMMENT_INPUT_MAX_HEIGHT ? 'auto' : 'hidden';
}

function toggleLike(button: HTMLButtonElement): void {
  const isPressed = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(isPressed));
}

function renderCommentsList(
  list: HTMLElement,
  comments: GameComment[],
  getAvatarColor: (author: string) => AvatarColor
): void {
  list.replaceChildren(
    ...comments.map((comment) => createCommentItem(comment, getAvatarColor(comment.author)))
  );
}

function setCommentsTitle(title: HTMLElement, total: number): void {
  title.textContent = `Comments (${total})`;
}

function createLikeResetRegistrar(): () => void {
  let hasRegistered = false;

  return function registerLikeResetOnLogout(): void {
    if (hasRegistered) {
      return;
    }

    hasRegistered = true;

    onAuthStateChange((session) => {
      if (session) {
        return;
      }

      const pressedLikeButtons = document.querySelectorAll<HTMLButtonElement>(
        PRESSED_LIKE_BUTTON_SELECTOR
      );

      for (const likeButton of pressedLikeButtons) {
        likeButton.setAttribute('aria-pressed', 'false');
      }
    });
  };
}

const registerLikeResetOnLogout = createLikeResetRegistrar();

export function createGameComments(slug: string): HTMLElement {
  registerLikeResetOnLogout();

  const getAvatarColor = createAvatarColorPicker();

  const section = document.createElement('section');
  section.className = 'game-details-dialog__comments';
  section.setAttribute('aria-labelledby', COMMENTS_TITLE_ID);
  section.innerHTML = `
    <h3 class="game-details-dialog__comments-title" id="${COMMENTS_TITLE_ID}">Comments</h3>

    <form class="game-details-dialog__comment-form">
      <span class="game-details-dialog__user-avatar" aria-hidden="true"></span>
      <label class="game-details-dialog__comment-label" for="${COMMENT_INPUT_ID}">
        Write a comment
      </label>
      <textarea
        class="game-details-dialog__comment-input"
        id="${COMMENT_INPUT_ID}"
        name="comment"
        rows="1"
        placeholder="Write a comment..."
      ></textarea>
      <button
        class="game-details-dialog__comment-submit"
        type="submit"
        aria-label="Submit comment"
        disabled
      >
        <img class="game-details-dialog__comment-submit-icon" src="${sendIcon}" alt="" />
      </button>
    </form>

    <ul class="game-details-dialog__comments-list">${createCommentsSkeleton(SKELETON_COUNT)}</ul>
  `;

  const title = section.querySelector<HTMLElement>('.game-details-dialog__comments-title');
  const form = section.querySelector('form');
  const avatar = section.querySelector<HTMLElement>('.game-details-dialog__user-avatar');
  const textarea = section.querySelector<HTMLTextAreaElement>(
    '.game-details-dialog__comment-input'
  );
  const submitButton = section.querySelector<HTMLButtonElement>(
    '.game-details-dialog__comment-submit'
  );
  const list = section.querySelector<HTMLElement>('.game-details-dialog__comments-list');

  const formState = { sending: false };

  function syncCommentForm(): void {
    if (!textarea || !submitButton || !avatar) {
      return;
    }

    const session = getCurrentSession();
    const isLocked = !session || formState.sending;

    textarea.disabled = isLocked;
    submitButton.disabled = isLocked || textarea.value.trim() === '';
    avatar.textContent = session ? session.displayName.charAt(0).toUpperCase() : '';
  }

  async function submitComment(): Promise<void> {
    if (!textarea || !submitButton || formState.sending) {
      return;
    }

    const session = getCurrentSession();

    if (!session) {
      return;
    }

    const text = textarea.value.trim();

    if (text.length === 0 || text.length > COMMENT_MAX_LENGTH) {
      showSnackbar(COMMENT_LENGTH_ERROR_MESSAGE, 'error');
      return;
    }

    formState.sending = true;
    syncCommentForm();

    try {
      await postGameComment(slug, {
        userEmail: session.email,
        authorName: session.displayName,
        text,
      });

      textarea.value = '';
      resizeCommentInput(textarea);

      const { comments, total } = await fetchGameComments(slug, session.email);

      if (!section.isConnected) {
        return;
      }

      if (title) {
        setCommentsTitle(title, total);
      }

      if (list) {
        if (comments.length === 0) {
          list.replaceChildren(createCommentsEmptyState());
        } else {
          renderCommentsList(list, comments, getAvatarColor);
        }
      }
    } catch (error) {
      if (!section.isConnected) {
        return;
      }

      showSnackbar(
        error instanceof ApiNetworkError
          ? COMMENT_POST_UNKNOWN_MESSAGE
          : COMMENT_POST_ERROR_MESSAGE,
        'error'
      );
    } finally {
      formState.sending = false;
      syncCommentForm();
    }
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    runProtectedAction(() => void submitComment());
  });

  textarea?.addEventListener('input', () => {
    resizeCommentInput(textarea);
    syncCommentForm();
  });

  textarea?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    form?.requestSubmit();
  });

  onAuthStateChange(() => {
    if (!section.isConnected) {
      return;
    }

    syncCommentForm();
  });

  syncCommentForm();

  list?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const likeButton = event.target.closest<HTMLButtonElement>(LIKE_BUTTON_SELECTOR);

    if (likeButton) {
      runProtectedAction(() => toggleLike(likeButton));
    }
  });

  const load = async (): Promise<void> => {
    if (!list) return;

    list.innerHTML = createCommentsSkeleton(SKELETON_COUNT);

    try {
      const { comments, total } = await fetchGameComments(slug);

      if (!section.isConnected) return;

      if (title) setCommentsTitle(title, total);

      if (comments.length === 0) {
        list.replaceChildren(createCommentsEmptyState());
        return;
      }

      renderCommentsList(list, comments, getAvatarColor);
    } catch {
      if (!section.isConnected) return;
      list.replaceChildren(createCommentsErrorBanner(() => void load()));
      showSnackbar('Could not load comments.', 'error');
    }
  };

  void load();

  return section;
}
