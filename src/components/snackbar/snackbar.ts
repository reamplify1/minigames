import './snackbar.scss';

type SnackbarVariant = 'success' | 'error';

const AUTO_DISMISS_MS = 4000;

function createContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'snackbar-container';
  container.setAttribute('aria-live', 'polite');
  // A `popover` element always renders in the browser's "top layer" — the
  // same layer a native <dialog> uses — so it paints above any open dialog
  // regardless of z-index, and isn't affected by a dialog's own opening
  // transition (nesting the container inside the dialog instead would briefly
  // inherit the dialog's animating `transform` as a containing block, making
  // a fixed-position child jump from mid-screen to the real corner once the
  // animation ends). "manual" means it's never light-dismissed by an outside
  // click or Escape.
  container.setAttribute('popover', 'manual');
  document.body.append(container);

  return container;
}

const getContainer = (() => {
  let container: HTMLElement | undefined;

  return (): HTMLElement => {
    container ??= createContainer();

    // Re-showing an already-open popover moves it to the top of the top
    // layer's stack — above any <dialog> that has opened since this
    // container was first created. Without this, a toast shown after a
    // dialog opens could end up stacked underneath that dialog instead of
    // above it.
    if (container.matches(':popover-open')) {
      container.hidePopover();
    }

    try {
      container.showPopover();
    } catch {
      // Popover API unavailable in this browser — the container still
      // renders in the normal document flow, just without the top-layer
      // guarantee above an open <dialog>.
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
