import './leaderboard.states.scss';

export function createSkeletonRows(count: number): string {
  return Array.from(
    { length: count },
    () => `
      <tr class="leaderboard__row leaderboard__row--skeleton" aria-hidden="true">
        <td class="leaderboard__cell" colspan="6">
          <div class="leaderboard__skeleton-line"></div>
        </td>
      </tr>
    `
  ).join('');
}

export function createErrorBanner(onRetry: () => void): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'leaderboard__error';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = 'Failed to load the leaderboard.';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', onRetry);

  banner.append(text, retryButton);
  return banner;
}

export function createEmptyState(): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'leaderboard__empty';
  empty.textContent = 'No leaderboard data yet.';
  return empty;
}
