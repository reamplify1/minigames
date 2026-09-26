import './game-details-dialog.scss';

const DIALOG_SELECTOR = '.game-details-dialog';
const TITLE_ID = 'game-details-title';
const MOCK_GAME_TITLE = 'Tukoni: Forest Keepers';

function createDialogContent(): string {
  return `
    <div class="game-details-dialog__content">
      <h2 class="game-details-dialog__title" id="${TITLE_ID}">${MOCK_GAME_TITLE}</h2>
    </div>
  `;
}

function createGameDetailsDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-details-dialog';
  dialog.setAttribute('aria-labelledby', TITLE_ID);

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
