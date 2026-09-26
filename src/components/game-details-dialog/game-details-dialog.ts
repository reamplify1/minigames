import './game-details-dialog.scss';
import heroImage from '../../assets/images/games/tukoni-forest-keepers.png';

const DIALOG_SELECTOR = '.game-details-dialog';
const CLOSE_SELECTOR = '[data-dialog-close]';
const TITLE_ID = 'game-details-title';
const MOCK_GAME_TITLE = 'Tukoni: Forest Keepers';

const CLOSE_ICON = `
  <svg class="game-details-dialog__close-icon" viewBox="0 -960 960 960" aria-hidden="true">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
`;

function createDialogContent(): string {
  return `
    <div class="game-details-dialog__content">
      <header class="game-details-dialog__hero">
        <img
          class="game-details-dialog__hero-image"
          src="${heroImage}"
          alt="${MOCK_GAME_TITLE} artwork"
        />
        <button
          class="game-details-dialog__close"
          type="button"
          aria-label="Close dialog"
          data-dialog-close
        >
          ${CLOSE_ICON}
        </button>
      </header>
      <h2 class="game-details-dialog__title" id="${TITLE_ID}">${MOCK_GAME_TITLE}</h2>
    </div>
  `;
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

    if (event.target instanceof Element && event.target.closest(CLOSE_SELECTOR)) {
      dialog.close();
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
}
