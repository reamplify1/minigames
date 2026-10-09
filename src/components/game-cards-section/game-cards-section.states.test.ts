import { describe, it, expect, vi } from 'vitest';
import {
  createSkeletonList,
  createErrorBanner,
  createEmptyState,
} from './game-cards-section.states';

describe('game cards section states', () => {
  it('builds the requested number of skeleton cards', () => {
    const list = document.createElement('ul');
    list.innerHTML = createSkeletonList(4);

    expect(list.querySelectorAll('.library-games__skeleton-card')).toHaveLength(4);
  });

  it('shows an error banner that calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    const banner = createErrorBanner(onRetry);

    banner.querySelector('button')?.click();

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Failed to load games.');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state message', () => {
    expect(createEmptyState().textContent).toBe('No games available right now.');
  });
});
