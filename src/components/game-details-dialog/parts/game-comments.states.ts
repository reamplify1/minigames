import './game-comments.states.scss';

export function createCommentsSkeleton(count: number): string {
  return Array.from(
    { length: count },
    () => '<li class="game-details-dialog__comment-skeleton" aria-hidden="true"></li>'
  ).join('');
}

export function createCommentsErrorBanner(onRetry: () => void): HTMLElement {
  const banner = document.createElement('li');
  banner.className = 'game-details-dialog__comments-error';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = 'Failed to load comments.';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', onRetry);

  banner.append(text, retryButton);
  return banner;
}

export function createCommentsEmptyState(): HTMLElement {
  const empty = document.createElement('li');
  empty.className = 'game-details-dialog__comments-empty';
  empty.textContent = 'No comments yet. Be the first to share your thoughts!';
  return empty;
}
