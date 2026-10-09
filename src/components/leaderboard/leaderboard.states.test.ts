import { describe, it, expect, vi } from 'vitest';
import { createSkeletonRows, createErrorBanner, createEmptyState } from './leaderboard.states';

describe('leaderboard states', () => {
  it('builds the requested number of skeleton rows', () => {
    const table = document.createElement('table');
    const body = document.createElement('tbody');
    body.innerHTML = createSkeletonRows(5);
    table.append(body);

    expect(table.querySelectorAll('.leaderboard__row--skeleton')).toHaveLength(5);
  });

  it('shows an error banner that calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    const banner = createErrorBanner(onRetry);

    banner.querySelector('button')?.click();

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Failed to load the leaderboard.');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state message', () => {
    expect(createEmptyState().textContent).toBe('No leaderboard data yet.');
  });
});
