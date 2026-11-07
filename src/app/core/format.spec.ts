import { formatCompactNumber, formatRelativeTime } from './format';

const MINUTE: number = 60_000;
const HOUR: number = 60 * MINUTE;
const DAY: number = 24 * HOUR;

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

describe('formatCompactNumber', () => {
  it('keeps numbers below a thousand as they are', () => {
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('shortens thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1.0K');
    expect(formatCompactNumber(28_700)).toBe('28.7K');
  });
});

describe('formatRelativeTime', () => {
  it.each([
    [10_000, 'just now'],
    [5 * MINUTE, '5 min ago'],
    [HOUR, '1 hour ago'],
    [3 * HOUR, '3 hours ago'],
    [2 * DAY, '2 days ago'],
    [14 * DAY, '2 weeks ago'],
    [90 * DAY, '3 months ago'],
    [400 * DAY, '1 year ago'],
  ])('formats %i ms ago as "%s"', (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed))).toBe(expected);
  });
});
