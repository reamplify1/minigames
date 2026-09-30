import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';
import { createFilterSortSection } from '../../components/filter-sort-section/filter-sort-section';
import {
  FALLBACK_CATEGORY_ID,
  DEFAULT_SORT_ID,
} from '../../components/filter-sort-section/filter-sort-section.data';
import { createGameCardsSection } from '../../components/game-cards-section/game-cards-section';
import type { GameFilters } from '../../components/game-cards-section/games.data';
import { createPaginationSection } from '../../components/pagination-section/pagination-section';

const FIRST_PAGE = 1;

export function renderLibraryPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';

  const filters: GameFilters = {
    category: FALLBACK_CATEGORY_ID,
    sort: DEFAULT_SORT_ID,
    page: FIRST_PAGE,
  };

  const paginationSection = createPaginationSection({
    onPageChange: (page) => {
      filters.page = page;
      gameCardsSection.setFilters(filters);
    },
  });

  const gameCardsSection = createGameCardsSection({
    onMetaChange: (meta) => paginationSection.setPagination(meta),
  });

  const filterSortSection = createFilterSortSection({
    onFilterChange: (categoryId) => {
      filters.category = categoryId;
      filters.page = FIRST_PAGE;
      gameCardsSection.setFilters(filters);
    },
    onSortChange: (sortId) => {
      filters.sort = sortId;
      filters.page = FIRST_PAGE;
      gameCardsSection.setFilters(filters);
    },
    onDefaultCategoryChange: (categoryId) => {
      if (filters.category === categoryId) return;
      filters.category = categoryId;
      filters.page = FIRST_PAGE;
      gameCardsSection.setFilters(filters);
    },
  });

  gameCardsSection.setFilters(filters);

  main.append(filterSortSection, gameCardsSection.element, paginationSection.element);

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}
