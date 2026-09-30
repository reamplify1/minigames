import './game-details-dialog.states.scss';
import closeIcon from '../../assets/icons/close-blue-icon.svg';

function createCloseButton(onClose: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'game-details-dialog__close';
  button.setAttribute('aria-label', 'Close dialog');
  button.innerHTML = `<img class="game-details-dialog__close-icon" src="${closeIcon}" alt="" />`;
  button.addEventListener('click', onClose);
  return button;
}

export function createDialogSkeleton(onClose: () => void): HTMLElement {
  const content = document.createElement('div');
  content.className = 'game-details-dialog__content';
  content.setAttribute('aria-busy', 'true');
  content.innerHTML = `
    <div class="game-details-dialog__hero game-details-dialog__hero--skeleton"></div>
    <div class="game-details-dialog__body">
      <div
        class="game-details-dialog__skeleton-line game-details-dialog__skeleton-line--title"
      ></div>
      <div class="game-details-dialog__skeleton-line"></div>
      <div
        class="game-details-dialog__skeleton-line game-details-dialog__skeleton-line--short"
      ></div>
      <div
        class="game-details-dialog__skeleton-line game-details-dialog__skeleton-line--short"
      ></div>
    </div>
  `;

  content.append(createCloseButton(onClose));
  return content;
}

export function createDialogErrorBanner(onRetry: () => void, onClose: () => void): HTMLElement {
  const content = document.createElement('div');
  content.className = 'game-details-dialog__content';
  content.innerHTML = `
    <div class="game-details-dialog__state" role="alert">
      <p class="game-details-dialog__state-text">Failed to load game details.</p>
      <button class="game-details-dialog__state-retry" type="button">Retry</button>
    </div>
  `;

  content.querySelector('.game-details-dialog__state-retry')?.addEventListener('click', onRetry);
  content.append(createCloseButton(onClose));
  return content;
}

export function createDialogEmptyState(onClose: () => void): HTMLElement {
  const content = document.createElement('div');
  content.className = 'game-details-dialog__content';
  content.innerHTML = `
    <div class="game-details-dialog__state game-details-dialog__state--empty">
      <p class="game-details-dialog__state-text">This game could not be found.</p>
    </div>
  `;

  content.append(createCloseButton(onClose));
  return content;
}
