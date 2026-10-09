import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime } from './game-comments.data';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function isoAgo(msAgo: number): string {
  return new Date(NOW.getTime() - msAgo).toISOString();
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "just now" for timestamps under a minute old', () => {
    expect(formatRelativeTime(isoAgo(30 * SECOND_MS))).toBe('just now');
  });

  it('shows minutes for timestamps under an hour old', () => {
    expect(formatRelativeTime(isoAgo(5 * MINUTE_MS))).toBe('5 min ago');
  });

  it('shows hours, singular and plural, for timestamps under a day old', () => {
    expect(formatRelativeTime(isoAgo(1 * HOUR_MS))).toBe('1 hour ago');
    expect(formatRelativeTime(isoAgo(3 * HOUR_MS))).toBe('3 hours ago');
  });

  it('shows days for timestamps under a week old', () => {
    expect(formatRelativeTime(isoAgo(2 * DAY_MS))).toBe('2 days ago');
  });

  it('shows weeks for timestamps under four weeks old', () => {
    expect(formatRelativeTime(isoAgo(2 * WEEK_MS))).toBe('2 weeks ago');
  });

  it('shows months for timestamps under a year old', () => {
    expect(formatRelativeTime(isoAgo(3 * MONTH_MS))).toBe('3 months ago');
  });

  it('shows years for timestamps a year old or more', () => {
    expect(formatRelativeTime(isoAgo(2 * YEAR_MS))).toBe('2 years ago');
  });
});
