import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showSnackbar } from './snackbar';

describe('showSnackbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom does not know the ":popover-open" selector, so we tell the
    // snackbar the container is not open yet.
    vi.spyOn(Element.prototype, 'matches').mockReturnValue(false);
    for (const item of document.querySelectorAll('.snackbar')) {
      item.remove();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the message with the given variant', () => {
    showSnackbar('Saved!', 'success');

    const item = document.querySelector('.snackbar');

    expect(item?.classList.contains('snackbar--success')).toBe(true);
    expect(item?.getAttribute('role')).toBe('status');
    expect(item?.querySelector('.snackbar__text')?.textContent).toBe('Saved!');
  });

  it('removes the message when the close button is clicked', () => {
    showSnackbar('Oops', 'error');

    document.querySelector<HTMLButtonElement>('.snackbar__close')?.click();

    expect(document.querySelector('.snackbar')).toBeNull();
  });

  it('removes the message automatically after 4 seconds', () => {
    showSnackbar('Oops', 'error');

    vi.advanceTimersByTime(3999);
    expect(document.querySelector('.snackbar')).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(document.querySelector('.snackbar')).toBeNull();
  });

  it('puts every message into one shared container', () => {
    showSnackbar('First', 'success');
    showSnackbar('Second', 'error');

    expect(document.querySelectorAll('.snackbar-container')).toHaveLength(1);
    expect(document.querySelectorAll('.snackbar')).toHaveLength(2);
  });
});
