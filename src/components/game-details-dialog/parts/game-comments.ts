import heartOutlineIcon from '../../../assets/icons/fav-icon.svg';
import sendIcon from '../../../assets/icons/send-icon.svg';
import { fetchGameComments, type GameComment } from './game-comments.data';
import {
  createCommentsSkeleton,
  createCommentsErrorBanner,
  createCommentsEmptyState,
} from './game-comments.states';
import { showSnackbar } from '../../snackbar/snackbar';

const COMMENTS_TITLE_ID = 'game-details-comments-title';
const COMMENT_INPUT_ID = 'game-details-comment-input';
const COMMENT_INPUT_MAX_HEIGHT = 88;
const SKELETON_COUNT = 3;

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
          >
            <img class="game-details-dialog__like-icon" src="${heartOutlineIcon}" alt="" />
            <span class="game-details-dialog__like-count">${likes}</span>
          </button>
        </footer>
      </article>
    </li>
  `;
}

// "1.5px" → 1.5
function parsePixels(value: string): number {
  return Number(value.replace('px', '')) || 0;
}

// Grows the textarea with its text, up to 88px. After that a scrollbar appears.
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

function renderCommentsList(list: HTMLElement, comments: GameComment[]): void {
  list.innerHTML = comments.map((comment) => createCommentItem(comment)).join('');
}

function setCommentsTitle(title: HTMLElement, total: number): void {
  title.textContent = `Comments (${total})`;
}

export function createGameComments(slug: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-details-dialog__comments';
  section.setAttribute('aria-labelledby', COMMENTS_TITLE_ID);
  section.innerHTML = `
    <h3 class="game-details-dialog__comments-title" id="${COMMENTS_TITLE_ID}">Comments</h3>

    <form class="game-details-dialog__comment-form">
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
  const textarea = section.querySelector('textarea');
  const submitButton = section.querySelector<HTMLButtonElement>(
    '.game-details-dialog__comment-submit'
  );
  const list = section.querySelector<HTMLElement>('.game-details-dialog__comments-list');

  // Sending comments comes in a later story, so the form does nothing for now.
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  textarea?.addEventListener('input', () => {
    resizeCommentInput(textarea);

    if (submitButton) {
      submitButton.disabled = textarea.value.trim() === '';
    }
  });

  // One listener for all like buttons in the list.
  list?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const likeButton = event.target.closest<HTMLButtonElement>('.game-details-dialog__like');

    if (likeButton) {
      toggleLike(likeButton);
    }
  });

  const load = async (): Promise<void> => {
    if (!list) return;

    list.innerHTML = createCommentsSkeleton(SKELETON_COUNT);

    try {
      const { comments, total } = await fetchGameComments(slug);

      // The dialog may already be closed (and its content replaced) by the
      // time this resolves — skip touching detached DOM.
      if (!section.isConnected) return;

      if (title) setCommentsTitle(title, total);

      if (comments.length === 0) {
        list.replaceChildren(createCommentsEmptyState());
        return;
      }

      renderCommentsList(list, comments);
    } catch {
      if (!section.isConnected) return;
      list.replaceChildren(createCommentsErrorBanner(() => void load()));
      showSnackbar('Could not load comments.', 'error');
    }
  };

  void load();

  return section;
}
