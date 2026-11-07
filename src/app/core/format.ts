const MINUTE_IN_MS: number = 60_000;
const HOUR_IN_MS: number = 60 * MINUTE_IN_MS;
const DAY_IN_MS: number = 24 * HOUR_IN_MS;
const WEEK_IN_MS: number = 7 * DAY_IN_MS;
const FOUR_WEEKS_IN_MS: number = 4 * WEEK_IN_MS;
const MONTH_IN_MS: number = 30 * DAY_IN_MS;
const YEAR_IN_MS: number = 365 * DAY_IN_MS;
const MAX_DISPLAYED_MONTHS: number = 11;

export function formatCompactNumber(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function formatUnit(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

export function formatRelativeTime(isoDate: string): string {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();

  if (elapsedMs < MINUTE_IN_MS) return 'just now';
  if (elapsedMs < HOUR_IN_MS) return `${Math.floor(elapsedMs / MINUTE_IN_MS)} min ago`;
  if (elapsedMs < DAY_IN_MS) return formatUnit(Math.floor(elapsedMs / HOUR_IN_MS), 'hour');
  if (elapsedMs < WEEK_IN_MS) return formatUnit(Math.floor(elapsedMs / DAY_IN_MS), 'day');
  if (elapsedMs < FOUR_WEEKS_IN_MS) return formatUnit(Math.floor(elapsedMs / WEEK_IN_MS), 'week');

  if (elapsedMs < YEAR_IN_MS) {
    const months = Math.floor(elapsedMs / MONTH_IN_MS);
    return formatUnit(Math.min(Math.max(months, 1), MAX_DISPLAYED_MONTHS), 'month');
  }

  return formatUnit(Math.floor(elapsedMs / YEAR_IN_MS), 'year');
}
