import './pagination-section.scss';

const MOBILE_QUERY = '(max-width: 767px)';
const MAX_VISIBLE_DESKTOP = 4;
const MAX_VISIBLE_MOBILE = 3;

const CHEVRON_LEFT = 'M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z';
const CHEVRON_RIGHT = 'M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z';

type ArrowDirection = 'previous' | 'next';

interface PaginationOptions {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createArrowButton(direction: ArrowDirection): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pagination__arrow pagination__arrow--${direction}`;
  button.setAttribute('aria-label', direction === 'previous' ? 'Previous page' : 'Next page');
  button.innerHTML = `
    <svg class="pagination__arrow-icon" viewBox="0 -960 960 960" aria-hidden="true">
      <path d="${direction === 'previous' ? CHEVRON_LEFT : CHEVRON_RIGHT}" fill="currentColor" />
    </svg>
  `;
  return button;
}

function createPageItem(page: number, isActive: boolean): HTMLLIElement {
  const item = document.createElement('li');
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'pagination__page';
  button.textContent = String(page);
  button.dataset.page = String(page);
  button.setAttribute('aria-label', `Page ${page}`);

  if (isActive) {
    button.classList.add('pagination__page--active');
    button.setAttribute('aria-current', 'page');
  }

  item.append(button);
  return item;
}

export function createPaginationSection({
  totalPages = 4,
  initialPage = 1,
  onPageChange,
}: PaginationOptions = {}): HTMLElement {
  const section = document.createElement('section');
  section.className = 'pagination-section';

  const nav = document.createElement('nav');
  nav.className = 'pagination';
  nav.setAttribute('aria-label', 'Library pagination');

  const previousButton = createArrowButton('previous');
  const nextButton = createArrowButton('next');
  const pagesList = document.createElement('ul');
  pagesList.className = 'pagination__pages';

  nav.append(previousButton, pagesList, nextButton);
  section.append(nav);

  const mobileQuery = globalThis.matchMedia(MOBILE_QUERY);
  let currentPage = clamp(initialPage, 1, totalPages);

  const getVisiblePages = (): number[] => {
    const maxVisible = mobileQuery.matches ? MAX_VISIBLE_MOBILE : MAX_VISIBLE_DESKTOP;
    const visibleCount = Math.min(maxVisible, totalPages);
    const start = clamp(
      currentPage - Math.floor((visibleCount - 1) / 2),
      1,
      totalPages - visibleCount + 1
    );

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  };

  const render = (): void => {
    const wasFocusInside = pagesList.contains(document.activeElement);

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pagesList.replaceChildren(
      ...getVisiblePages().map((page) => createPageItem(page, page === currentPage))
    );

    if (wasFocusInside) {
      pagesList.querySelector<HTMLButtonElement>('.pagination__page--active')?.focus();
    }
  };

  const goToPage = (page: number): void => {
    if (page === currentPage || page < 1 || page > totalPages) return;

    currentPage = page;
    render();
    onPageChange?.(page);
  };

  previousButton.addEventListener('click', () => goToPage(currentPage - 1));
  nextButton.addEventListener('click', () => goToPage(currentPage + 1));

  pagesList.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.pagination__page');
    if (button) goToPage(Number(button.dataset.page));
  });

  mobileQuery.addEventListener('change', render);

  render();
  return section;
}
