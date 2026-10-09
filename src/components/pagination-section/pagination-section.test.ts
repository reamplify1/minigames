import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPaginationSection } from './pagination-section';

// jsdom has no matchMedia, so we give the component a fake one. "matches"
// says whether the screen is mobile, and we keep the "change" listener so a
// test can pretend the screen size changed.
interface FakeMediaQuery {
  matches: boolean;
  changeListener?: () => void;
  addEventListener: (type: string, listener: () => void) => void;
}

const fakeMediaQuery: FakeMediaQuery = {
  matches: false,
  addEventListener(type, listener) {
    if (type === 'change') {
      fakeMediaQuery.changeListener = listener;
    }
  },
};

function getPageNumbers(section: HTMLElement): number[] {
  return [...section.querySelectorAll<HTMLButtonElement>('.pagination__page')].map((button) =>
    Number(button.textContent)
  );
}

function getActivePage(section: HTMLElement): HTMLButtonElement | null {
  return section.querySelector<HTMLButtonElement>('.pagination__page--active');
}

function getArrow(section: HTMLElement, direction: 'previous' | 'next'): HTMLButtonElement {
  const selector =
    direction === 'previous' ? '.pagination__arrow--previous' : '.pagination__arrow--next';
  return section.querySelector(selector) as HTMLButtonElement;
}

function clickPage(section: HTMLElement, page: number): void {
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('.pagination__page')];
  buttons.find((button) => button.dataset.page === String(page))?.click();
}

describe('createPaginationSection', () => {
  beforeEach(() => {
    fakeMediaQuery.matches = false;
    delete fakeMediaQuery.changeListener;
    vi.stubGlobal('matchMedia', () => fakeMediaQuery);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with a single page and both arrows disabled', () => {
    const { element } = createPaginationSection();

    expect(getPageNumbers(element)).toEqual([1]);
    expect(getArrow(element, 'previous').disabled).toBe(true);
    expect(getArrow(element, 'next').disabled).toBe(true);
  });

  it('shows up to four pages on desktop and marks the current one', () => {
    const { element, setPagination } = createPaginationSection();

    setPagination({ page: 1, totalPages: 10 });

    expect(getPageNumbers(element)).toEqual([1, 2, 3, 4]);
    expect(getActivePage(element)?.textContent).toBe('1');
    expect(getActivePage(element)?.getAttribute('aria-current')).toBe('page');
    expect(getArrow(element, 'previous').disabled).toBe(true);
    expect(getArrow(element, 'next').disabled).toBe(false);
  });

  it('keeps the current page near the middle and stops at the last page', () => {
    const { element, setPagination } = createPaginationSection();

    setPagination({ page: 5, totalPages: 10 });
    expect(getPageNumbers(element)).toEqual([4, 5, 6, 7]);

    setPagination({ page: 10, totalPages: 10 });
    expect(getPageNumbers(element)).toEqual([7, 8, 9, 10]);
    expect(getArrow(element, 'next').disabled).toBe(true);
  });

  it('shows only three pages on mobile and updates when the screen size changes', () => {
    const { element, setPagination } = createPaginationSection();
    setPagination({ page: 5, totalPages: 10 });

    fakeMediaQuery.matches = true;
    fakeMediaQuery.changeListener?.();

    expect(getPageNumbers(element)).toEqual([4, 5, 6]);
  });

  it('treats zero pages as one and keeps the page inside the valid range', () => {
    const { element, setPagination } = createPaginationSection();

    setPagination({ page: 3, totalPages: 0 });

    expect(getPageNumbers(element)).toEqual([1]);
    expect(getActivePage(element)?.textContent).toBe('1');
  });

  it('reports the new page when a page button or an arrow is clicked', () => {
    const onPageChange = vi.fn();
    const { element, setPagination } = createPaginationSection({ onPageChange });
    setPagination({ page: 1, totalPages: 10 });

    clickPage(element, 3);
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(getActivePage(element)?.textContent).toBe('3');

    getArrow(element, 'next').click();
    expect(onPageChange).toHaveBeenLastCalledWith(4);

    getArrow(element, 'previous').click();
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('does nothing when the current page is clicked again', () => {
    const onPageChange = vi.fn();
    const { element, setPagination } = createPaginationSection({ onPageChange });
    setPagination({ page: 2, totalPages: 10 });

    clickPage(element, 2);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('keeps keyboard focus on the active page after the list is redrawn', () => {
    const { element, setPagination } = createPaginationSection();
    document.body.replaceChildren(element);
    setPagination({ page: 1, totalPages: 10 });
    const pageTwo = [...element.querySelectorAll<HTMLButtonElement>('.pagination__page')][1];

    pageTwo?.focus();
    pageTwo?.click();

    expect(document.activeElement).toBe(getActivePage(element));
    expect(getActivePage(element)?.textContent).toBe('2');
  });
});
