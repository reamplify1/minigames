import './filter-sort-section.states.scss';

const CHIP_SLOT_ATTRIBUTE = 'data-chips-slot';

export function createChipsSkeleton(count: number): HTMLUListElement {
  const list = document.createElement('ul');
  list.className = 'filter-sort-bar__chips';
  list.setAttribute('role', 'list');
  list.setAttribute(CHIP_SLOT_ATTRIBUTE, '');
  list.setAttribute('aria-hidden', 'true');

  list.innerHTML = Array.from(
    { length: count },
    () => '<li class="filter-sort-bar__chip-skeleton"></li>'
  ).join('');

  return list;
}

export function createChipsErrorBanner(onRetry: () => void): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'filter-sort-bar__error';
  banner.setAttribute(CHIP_SLOT_ATTRIBUTE, '');
  banner.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent = 'Failed to load categories.';

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', onRetry);

  banner.append(text, retryButton);
  return banner;
}

export function createChipsEmptyState(): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'filter-sort-bar__empty';
  empty.setAttribute(CHIP_SLOT_ATTRIBUTE, '');
  empty.textContent = 'No categories available.';
  return empty;
}

export function createChipsList(): HTMLUListElement {
  const list = document.createElement('ul');
  list.className = 'filter-sort-bar__chips';
  list.setAttribute('role', 'list');
  list.setAttribute(CHIP_SLOT_ATTRIBUTE, '');
  return list;
}

export const CHIPS_SLOT_SELECTOR = `[${CHIP_SLOT_ATTRIBUTE}]`;
