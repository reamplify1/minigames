import './snackbar.scss';

type SnackbarVariant = 'success' | 'error';

const AUTO_DISMISS_MS = 4000;

const getContainer = (() => {
  let container: HTMLElement | undefined;

  return (): HTMLElement => {
    if (!container) {
      container = document.createElement('div');
      container.className = 'snackbar-container';
      container.setAttribute('aria-live', 'polite');
      document.body.append(container);
    }
    return container;
  };
})();

export function showSnackbar(message: string, variant: SnackbarVariant): void {
  const root = getContainer();
  const item = document.createElement('div');
  item.className = `snackbar snackbar--${variant}`;
  item.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.className = 'snackbar__text';
  text.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.className = 'snackbar__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Dismiss notification');
  closeButton.textContent = '×';

  const remove = (): void => item.remove();
  closeButton.addEventListener('click', remove);

  item.append(text, closeButton);
  root.append(item);

  setTimeout(remove, AUTO_DISMISS_MS);
}
