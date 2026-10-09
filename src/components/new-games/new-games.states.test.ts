import { describe, it, expect, vi } from 'vitest';
import { createSkeleton, createErrorBanner, createEmptyState } from './new-games.states';

describe('new games states', () => {
  it('builds the requested number of skeleton cards', () => {
    const list = document.createElement('ul');
    list.innerHTML = createSkeleton(3);

    expect(list.querySelectorAll('.new-games__skeleton-card')).toHaveLength(3);
  });

  it('shows an error banner that calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    const banner = createErrorBanner(onRetry);

    banner.querySelector('button')?.click();

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Failed to load featured games.');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state message', () => {
    expect(createEmptyState().textContent).toBe('No featured games right now.');
  });
});
