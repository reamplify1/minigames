import './new-games.states.scss';

export function createSkeleton(count: number): string {
  return Array.from(
    { length: count },
    () => '<li class="new-games__skeleton-card" aria-hidden="true"></li>'
  ).join('');
}

export function createErrorBanner(onRetry: () => void): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'new-games__error';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = 'Failed to load featured games.';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', onRetry);

  banner.append(text, retryButton);
  return banner;
}

export function createEmptyState(): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'new-games__empty';
  empty.textContent = 'No featured games right now.';
  return empty;
}
