import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  CATEGORIES_URL,
  type CategoriesResponse,
} from '../../components/filter-sort-section/filter-sort-section.data';
import { type GamesResponse, getGamesUrl } from '../../components/game-cards-section/games.data';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { LibraryPage, parseFilters, toQueryParams } from './library-page';

const CATEGORIES: CategoriesResponse = {
  data: [
    { slug: 'all', label: 'All Games', isDefault: true },
    { slug: 'puzzle', label: 'Puzzle', isDefault: false },
  ],
};

const GAMES: GamesResponse = {
  data: [],
  meta: { page: 1, totalPages: 3 },
};

describe('parseFilters', () => {
  it('reads the filters from the URL', () => {
    const params = convertToParamMap({ category: 'puzzle', sort: 'name-asc', page: '3' });
    expect(parseFilters(params)).toEqual({ category: 'puzzle', sort: 'name-asc', page: 3 });
  });

  it('uses defaults for a missing or broken page', () => {
    expect(parseFilters(convertToParamMap({ page: 'abc' }))).toEqual({
      category: 'all',
      sort: 'rating-desc',
      page: 1,
    });
    expect(parseFilters(convertToParamMap({ page: '-2' })).page).toBe(1);
  });
});

describe('toQueryParams', () => {
  it('keeps default values out of the URL', () => {
    expect(toQueryParams({ category: 'all', sort: 'rating-desc', page: 1 })).toEqual({
      category: null,
      sort: null,
      page: null,
    });
  });
});

describe('LibraryPage', () => {
  async function setup(url: string): Promise<{
    harness: RouterTestingHarness;
    http: HttpTestingController;
  }> {
    TestBed.configureTestingModule({
      providers: provideTestApp(createFakeFirebase(), [
        { path: 'library', component: LibraryPage },
      ]),
    });

    const harness = await RouterTestingHarness.create(url);
    const http = TestBed.inject(HttpTestingController);

    return { harness, http };
  }

  it('resets to the first page when the category changes', async () => {
    const { harness, http } = await setup('/library?page=3');
    const filters = { category: 'all', sort: 'rating-desc', page: 3 };

    http.expectOne(CATEGORIES_URL).flush(CATEGORIES);
    http.expectOne(getGamesUrl(filters)).flush(GAMES);
    await settle();

    harness.routeNativeElement?.querySelectorAll<HTMLElement>('.chip')[1]?.click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/library?category=puzzle');
  });

  it('replaces an unknown category with the default one', async () => {
    const { http } = await setup('/library?category=nonsense');

    http.expectOne(CATEGORIES_URL).flush(CATEGORIES);
    await settle();

    expect(TestBed.inject(Router).url).toBe('/library');
  });

  it('does not load the games again when only a dialog opens', async () => {
    const { harness, http } = await setup('/library');

    http.expectOne(CATEGORIES_URL).flush(CATEGORIES);
    http.expectOne(getGamesUrl({ category: 'all', sort: 'rating-desc', page: 1 })).flush(GAMES);
    await settle();

    await harness.navigateByUrl('/library?game=palia');
    await settle();

    http.expectNone((request) => request.url.includes('/games?'));
  });
});
