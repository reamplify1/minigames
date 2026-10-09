import { describe, it, expect, vi } from 'vitest';
import {
  createDialogSkeleton,
  createDialogErrorBanner,
  createDialogEmptyState,
} from './game-details-dialog.states';

function clickClose(content: HTMLElement): void {
  content.querySelector<HTMLButtonElement>('.game-details-dialog__close')?.click();
}

describe('game details dialog states', () => {
  it('shows a busy skeleton that can still be closed', () => {
    const onClose = vi.fn();
    const content = createDialogSkeleton(onClose);

    clickClose(content);

    expect(content.getAttribute('aria-busy')).toBe('true');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error state with separate Retry and Close actions', () => {
    const onRetry = vi.fn();
    const onClose = vi.fn();
    const content = createDialogErrorBanner(onRetry, onClose);

    content.querySelector<HTMLButtonElement>('.game-details-dialog__state-retry')?.click();

    expect(content.textContent).toContain('Failed to load game details.');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    clickClose(content);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a "not found" state that can be closed', () => {
    const onClose = vi.fn();
    const content = createDialogEmptyState(onClose);

    clickClose(content);

    expect(content.textContent).toContain('This game could not be found.');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
