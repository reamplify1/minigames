import { describe, it, expect, vi } from 'vitest';
import {
  createChipsSkeleton,
  createChipsErrorBanner,
  createChipsEmptyState,
  createChipsList,
  CHIPS_SLOT_SELECTOR,
} from './filter-sort-section.states';

describe('filter sort section states', () => {
  it('builds the requested number of skeleton chips, hidden from screen readers', () => {
    const skeleton = createChipsSkeleton(4);

    expect(skeleton.querySelectorAll('.filter-sort-bar__chip-skeleton')).toHaveLength(4);
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows an error banner that calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    const banner = createChipsErrorBanner(onRetry);

    banner.querySelector('button')?.click();

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.textContent).toContain('Failed to load categories.');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state message', () => {
    expect(createChipsEmptyState().textContent).toBe('No categories available.');
  });

  it('marks every state with the chips slot so the section can swap between them', () => {
    const states = [
      createChipsSkeleton(1),
      createChipsErrorBanner(vi.fn()),
      createChipsEmptyState(),
      createChipsList(),
    ];

    for (const state of states) {
      expect(state.matches(CHIPS_SLOT_SELECTOR)).toBe(true);
    }
  });
});
