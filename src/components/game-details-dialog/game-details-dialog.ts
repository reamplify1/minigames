import './game-details-dialog.scss';

const NO_SCROLL_CLASS = 'no-scroll';

export function openGameDetailsDialog(): void {
  const overlay = document.createElement('div');
  overlay.className = 'game-details-dialog-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'game-details-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Game details');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'game-details-dialog__close';
  closeButton.setAttribute('aria-label', 'Close dialog');
  closeButton.textContent = '×';

  const placeholder = document.createElement('p');
  placeholder.className = 'game-details-dialog__placeholder';
  placeholder.textContent = 'Tukoni: Forest Keepers';

  dialog.append(closeButton, placeholder);
  overlay.append(dialog);
  document.body.append(overlay);
  document.body.classList.add(NO_SCROLL_CLASS);

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close();
  };

  const close = (): void => {
    overlay.remove();
    document.body.classList.remove(NO_SCROLL_CLASS);
    document.removeEventListener('keydown', handleKeydown);
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', handleKeydown);
}
