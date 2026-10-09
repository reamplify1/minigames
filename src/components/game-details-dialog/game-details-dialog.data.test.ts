import { describe, it, expect } from 'vitest';
import { formatLikes } from './game-details-dialog.data';

describe('formatLikes', () => {
  it('shows small counts as plain numbers', () => {
    expect(formatLikes(0)).toBe('0');
    expect(formatLikes(999)).toBe('999');
  });

  it('shows counts of 1000 and above abbreviated with one decimal and a K suffix', () => {
    expect(formatLikes(1000)).toBe('1.0K');
    expect(formatLikes(1500)).toBe('1.5K');
    expect(formatLikes(12_345)).toBe('12.3K');
  });
});
