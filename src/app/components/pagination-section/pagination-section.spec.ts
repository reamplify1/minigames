import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getVisiblePages, PaginationSection } from './pagination-section';

describe('getVisiblePages', () => {
  it('shows all pages when there are few', () => {
    expect(getVisiblePages(1, 2, 4)).toEqual([1, 2]);
  });

  it('keeps the current page near the middle', () => {
    expect(getVisiblePages(5, 10, 4)).toEqual([4, 5, 6, 7]);
  });

  it('does not go past the first or the last page', () => {
    expect(getVisiblePages(1, 10, 4)).toEqual([1, 2, 3, 4]);
    expect(getVisiblePages(10, 10, 4)).toEqual([7, 8, 9, 10]);
  });
});

describe('PaginationSection', () => {
  let fixture: ComponentFixture<PaginationSection>;

  async function setup(page: number, totalPages: number): Promise<void> {
    fixture = TestBed.createComponent(PaginationSection);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
  }

  function query(selector: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLButtonElement;
  }

  it('marks the current page', async () => {
    await setup(2, 4);
    expect(query('.pagination__page--active').textContent).toContain('2');
    expect(query('.pagination__page--active').getAttribute('aria-current')).toBe('page');
  });

  it('disables the arrows at the edges', async () => {
    await setup(1, 1);
    expect(query('.pagination__arrow--previous').disabled).toBe(true);
    expect(query('.pagination__arrow--next').disabled).toBe(true);
  });

  it('reports the next page', async () => {
    await setup(2, 4);
    const onPage = vi.fn();
    fixture.componentInstance.pageChange.subscribe(onPage);

    query('.pagination__arrow--next').click();

    expect(onPage).toHaveBeenCalledWith(3);
  });

  it('does not report a click on the current page', async () => {
    await setup(2, 4);
    const onPage = vi.fn();
    fixture.componentInstance.pageChange.subscribe(onPage);

    query('.pagination__page--active').click();

    expect(onPage).not.toHaveBeenCalled();
  });

  it('survives a response with zero pages', async () => {
    await setup(1, 0);
    expect(query('.pagination__page--active').textContent).toContain('1');
  });
});
