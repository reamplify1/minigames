import './game-details-dialog.scss';
import { MOCK_GAME_DETAILS } from './game-details-dialog.data';
import { createGameHero } from './parts/game-hero';
import { createGameInfo, GAME_TITLE_ID } from './parts/game-info';
import { createGameRecords } from './parts/game-records';
import { createGameComments } from './parts/game-comments';

const DIALOG_CLASS = 'game-details-dialog';

function createDialogContent(onClose: () => void): HTMLElement {
  const game = MOCK_GAME_DETAILS;

  const content = document.createElement('div');
  content.className = 'game-details-dialog__content';

  const body = document.createElement('div');
  body.className = 'game-details-dialog__body';
  body.append(
    createGameInfo(game),
    createGameRecords(game.records),
    createGameComments(game.comments)
  );

  content.append(createGameHero(game.title, onClose), body);

  return content;
}

function createGameDetailsDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = DIALOG_CLASS;
  dialog.setAttribute('aria-labelledby', GAME_TITLE_ID);

  // Click on the empty area around the card closes the dialog.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  return dialog;
}

function getGameDetailsDialog(): HTMLDialogElement {
  const existingDialog = document.querySelector<HTMLDialogElement>(`.${DIALOG_CLASS}`);

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

  // Fresh content on every open, so favorites, likes and the comment text are reset.
  dialog.replaceChildren(
    createDialogContent(() => {
      dialog.close();
    })
  );
  dialog.showModal();
  dialog.scrollTop = 0;
}
