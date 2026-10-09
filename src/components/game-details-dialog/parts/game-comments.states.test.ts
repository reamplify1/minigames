import { describe, it, expect, vi } from 'vitest';
import {
  createCommentsSkeleton,
  createCommentsErrorBanner,
  createCommentsEmptyState,
} from './game-comments.states';

describe('game comments states', () => {
  it('builds the requested number of skeleton comments', () => {
    const list = document.createElement('ul');
    list.innerHTML = createCommentsSkeleton(3);

    expect(list.querySelectorAll('.game-details-dialog__comment-skeleton')).toHaveLength(3);
  });

  it('shows an error banner that calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    const banner = createCommentsErrorBanner(onRetry);

    banner.querySelector('button')?.click();

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Failed to load comments.');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state message', () => {
    expect(createCommentsEmptyState().textContent).toBe(
      'No comments yet. Be the first to share your thoughts!'
    );
  });
});
