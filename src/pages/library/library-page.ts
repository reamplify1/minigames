import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';
import {
  createFilterSortSection,
  type FilterSortSection,
} from '../../components/filter-sort-section/filter-sort-section';
import {
  FALLBACK_CATEGORY_ID,
  DEFAULT_SORT_ID,
} from '../../components/filter-sort-section/filter-sort-section.data';
import {
  createGameCardsSection,
  type GameCardsSection,
} from '../../components/game-cards-section/game-cards-section';
import type { GameFilters } from '../../components/game-cards-section/games.data';
import {
  createPaginationSection,
  type PaginationSection,
} from '../../components/pagination-section/pagination-section';
import { navigate, type RouteContext } from '../../app/router';

const FIRST_PAGE = 1;

interface LibraryControls {
  filterSortSection: FilterSortSection;
  gameCardsSection: GameCardsSection;
  paginationSection: PaginationSection;
}

interface LibraryState {
  filters: GameFilters;
  controls: LibraryControls | undefined;
}

const state: LibraryState = {
  filters: {
    category: FALLBACK_CATEGORY_ID,
    sort: DEFAULT_SORT_ID,
    page: FIRST_PAGE,
  },
  controls: undefined,
};

function parseFiltersFromParameters(searchParameters: URLSearchParams): GameFilters {
  const category = searchParameters.get('category') ?? FALLBACK_CATEGORY_ID;
  const sort = searchParameters.get('sort') ?? DEFAULT_SORT_ID;
  const pageParameter = Number(searchParameters.get('page') ?? '');
  const page =
    Number.isSafeInteger(pageParameter) && pageParameter > 0 ? pageParameter : FIRST_PAGE;

  return { category, sort, page };
}

function buildLibraryUrl(nextFilters: GameFilters): string {
  const current = new URL(globalThis.location.href);
  const game = current.searchParams.get('game');
  const auth = current.searchParams.get('auth');

  const url = new URL('/library', globalThis.location.origin);

  if (nextFilters.category !== FALLBACK_CATEGORY_ID) {
    url.searchParams.set('category', nextFilters.category);
  }
  if (nextFilters.sort !== DEFAULT_SORT_ID) {
    url.searchParams.set('sort', nextFilters.sort);
  }
  if (nextFilters.page !== FIRST_PAGE) {
    url.searchParams.set('page', String(nextFilters.page));
  }
  if (game) url.searchParams.set('game', game);
  if (auth) url.searchParams.set('auth', auth);

  return `${url.pathname}${url.search}`;
}

function areFiltersEqual(a: GameFilters, b: GameFilters): boolean {
  return a.category === b.category && a.sort === b.sort && a.page === b.page;
}

export function renderLibraryPage(context: RouteContext): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';

  state.filters = parseFiltersFromParameters(context.searchParams);

  const paginationSection = createPaginationSection({
    onPageChange: (page) => {
      navigate(buildLibraryUrl({ ...state.filters, page }));
    },
  });

  const gameCardsSection = createGameCardsSection({
    onMetaChange: (meta) => paginationSection.setPagination(meta),
  });

  const filterSortSection = createFilterSortSection({
    initialFilter: state.filters.category,
    initialSort: state.filters.sort,
    onFilterChange: (categoryId) => {
      navigate(
        buildLibraryUrl({ category: categoryId, sort: state.filters.sort, page: FIRST_PAGE })
      );
    },
    onSortChange: (sortId) => {
      navigate(
        buildLibraryUrl({ category: state.filters.category, sort: sortId, page: FIRST_PAGE })
      );
    },
    onDefaultCategoryChange: (categoryId) => {
      if (state.filters.category === categoryId) return;
      navigate(buildLibraryUrl({ ...state.filters, category: categoryId }), { replace: true });
    },
  });

  state.controls = { filterSortSection, gameCardsSection, paginationSection };

  gameCardsSection.setFilters(state.filters);

  main.append(filterSortSection.element, gameCardsSection.element, paginationSection.element);
  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}

export function updateLibraryPage(context: RouteContext): void {
  const { controls } = state;
  if (!controls) return;

  const nextFilters = parseFiltersFromParameters(context.searchParams);

  if (areFiltersEqual(state.filters, nextFilters)) {
    return;
  }

  state.filters = nextFilters;
  controls.filterSortSection.setActiveFilter(nextFilters.category);
  controls.filterSortSection.setActiveSort(nextFilters.sort);
  controls.gameCardsSection.setFilters(nextFilters);
}
