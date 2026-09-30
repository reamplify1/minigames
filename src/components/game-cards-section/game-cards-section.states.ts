import './game-cards-section.states.scss';

export function createSkeletonList(count: number): string {
  return Array.from(
    { length: count },
    () => '<li class="library-games__skeleton-card" aria-hidden="true"></li>'
  ).join('');
}

export function createErrorBanner(onRetry: () => void): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'library-games__error';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = 'Failed to load games.';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', onRetry);

  banner.append(text, retryButton);
  return banner;
}

export function createEmptyState(): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'library-games__empty';
  empty.textContent = 'No games available right now.';
  return empty;
}
