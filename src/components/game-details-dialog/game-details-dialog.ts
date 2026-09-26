import './game-details-dialog.scss';

const DIALOG_SELECTOR = '.game-details-dialog';
const CLOSE_SELECTOR = '[data-dialog-close]';
const TITLE_ID = 'game-details-title';
const MOCK_GAME_TITLE = 'Tukoni: Forest Keepers';

function createDialogContent(): string {
  return `
    <div class="game-details-dialog__content">
      <button
        class="game-details-dialog__close"
        type="button"
        aria-label="Close dialog"
        data-dialog-close
      >
        ×
      </button>
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
