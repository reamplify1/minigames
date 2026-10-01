import './game-details-dialog.scss';
import { fetchGameDetails, type GameDetails } from './game-details-dialog.data';
import { createGameHero } from './parts/game-hero';
import { createGameInfo, GAME_TITLE_ID } from './parts/game-info';
import { createGameRecords } from './parts/game-records';
import { createGameComments } from './parts/game-comments';
import {
  createDialogSkeleton,
  createDialogErrorBanner,
  createDialogEmptyState,
} from './game-details-dialog.states';
import { showSnackbar } from '../snackbar/snackbar';
import { navigate } from '../../app/router';
import { withoutGameParameter } from '../../app/dialog-urls';

const DIALOG_CLASS = 'game-details-dialog';

function createDialogContent(slug: string, game: GameDetails, onClose: () => void): HTMLElement {
  const content = document.createElement('div');
  content.className = 'game-details-dialog__content';

  const body = document.createElement('div');
  body.className = 'game-details-dialog__body';
  body.append(createGameInfo(game), createGameRecords(game.records), createGameComments(slug));

  content.append(createGameHero(game.title, game.heroImage, onClose), body);

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

  dialog.addEventListener('close', () => {
    openState.slug = undefined;
    navigate(withoutGameParameter(), { replace: true });
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

const requestTracker = { requestId: 0 };
const openState: { slug: string | undefined } = { slug: undefined };

export function closeGameDetailsDialog(): void {
  const dialog = document.querySelector<HTMLDialogElement>(`.${DIALOG_CLASS}`);

  if (dialog?.open) {
    dialog.close();
  }
}

export function openGameDetailsDialog(slug: string): void {
  const dialog = getGameDetailsDialog();

  if (dialog.open && openState.slug === slug) {
    return;
  }

  openState.slug = slug;

  const onClose = (): void => {
    dialog.close();
  };

  const load = async (): Promise<void> => {
    const currentRequestId = ++requestTracker.requestId;

    dialog.replaceChildren(createDialogSkeleton(onClose));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;

    try {
      const game = await fetchGameDetails(slug);
      if (currentRequestId !== requestTracker.requestId) return;

      if (!game) {
        dialog.replaceChildren(createDialogEmptyState(onClose));
        return;
      }

      dialog.replaceChildren(createDialogContent(slug, game, onClose));
      dialog.scrollTop = 0;
    } catch {
      if (currentRequestId !== requestTracker.requestId) return;
      dialog.replaceChildren(createDialogErrorBanner(() => void load(), onClose));
      showSnackbar('Could not load game details.', 'error');
    }
  };

  void load();
}
