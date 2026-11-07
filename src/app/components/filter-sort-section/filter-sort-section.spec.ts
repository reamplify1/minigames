import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { FilterSortSection } from './filter-sort-section';
import {
  CATEGORIES_URL,
  type CategoriesResponse,
  type FilterChip,
  resolveCategory,
} from './filter-sort-section.data';

const API_CATEGORIES: CategoriesResponse = {
  data: [
    { slug: 'all', label: 'All Games', isDefault: true },
    { slug: 'puzzle', label: 'Puzzle', isDefault: false },
  ],
};

const CHIPS: FilterChip[] = API_CATEGORIES.data.map(({ slug, label, isDefault }) => ({
  id: slug,
  label,
  isDefault,
}));

describe('resolveCategory', () => {
  it('keeps a known category', () => {
    expect(resolveCategory('puzzle', CHIPS)).toBe('puzzle');
  });

  it('falls back to the default category', () => {
    expect(resolveCategory('nonsense', CHIPS)).toBe('all');
  });

  it('returns nothing while there are no chips', () => {
    expect(resolveCategory('all', [])).toBeUndefined();
  });
});

describe('FilterSortSection', () => {
  let fixture: ComponentFixture<FilterSortSection>;

  async function setup(category: string = 'all'): Promise<void> {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    fixture = TestBed.createComponent(FilterSortSection);
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('sort', 'rating-desc');
    await settle();
    TestBed.inject(HttpTestingController).expectOne(CATEGORIES_URL).flush(API_CATEGORIES);
    await settle();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('marks the active chip', async () => {
    await setup('puzzle');
    expect(element().querySelector('.chip--active')?.textContent).toContain('Puzzle');
  });

  it('reports a click on another chip', async () => {
    await setup();
    const onChange = vi.fn();
    fixture.componentInstance.categoryChange.subscribe(onChange);

    element().querySelectorAll<HTMLElement>('.chip')[1]?.click();

    expect(onChange).toHaveBeenCalledWith('puzzle');
  });

  it('reports the default category when the requested one does not exist', async () => {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    fixture = TestBed.createComponent(FilterSortSection);
    const onDefault = vi.fn();
    fixture.componentInstance.defaultCategoryChange.subscribe(onDefault);
    fixture.componentRef.setInput('category', 'nonsense');
    fixture.componentRef.setInput('sort', 'rating-desc');
    await settle();

    TestBed.inject(HttpTestingController).expectOne(CATEGORIES_URL).flush(API_CATEGORIES);
    await settle();

    expect(onDefault).toHaveBeenCalledWith('all');
  });

  it('opens the sort list, reports the choice and closes', async () => {
    await setup();
    const onSort = vi.fn();
    fixture.componentInstance.sortChange.subscribe(onSort);
    const list = element().querySelector<HTMLElement>('#sort-options');

    element().querySelector<HTMLElement>('.sort-trigger')?.click();
    await settle();
    expect(list?.hidden).toBe(false);

    element().querySelectorAll<HTMLElement>('.sort-dropdown__option')[2]?.click();
    await settle();

    expect(onSort).toHaveBeenCalledWith('name-asc');
    expect(list?.hidden).toBe(true);
  });

  it('closes the sort list on an outside click and on Escape', async () => {
    await setup();
    const trigger = element().querySelector<HTMLElement>('.sort-trigger');
    const list = element().querySelector<HTMLElement>('#sort-options');

    trigger?.click();
    await settle();
    document.body.click();
    await settle();
    expect(list?.hidden).toBe(true);

    trigger?.click();
    await settle();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(list?.hidden).toBe(true);
  });
});
