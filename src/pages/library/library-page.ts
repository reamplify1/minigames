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

  // Category and sort are separate controls, but they are never sent to the
  // API on their own: every change carries the *other* value along too, and
  // resets pagination back to page 1 (RSS-QS-3-2-2 / RSS-QS-3-2-3).
  const applyCategoryAndSort = (patch: Pick<GameFilters, 'category' | 'sort'>): void => {
    filters.category = patch.category;
    filters.sort = patch.sort;
    filters.page = FIRST_PAGE;
    gameCardsSection.setFilters(filters);
  };

  const filterSortSection = createFilterSortSection({
    onFilterChange: (categoryId) => {
      applyCategoryAndSort({ category: categoryId, sort: filters.sort });
    },
    onSortChange: (sortId) => {
      applyCategoryAndSort({ category: filters.category, sort: sortId });
    },
    onDefaultCategoryChange: (categoryId) => {
      // the optimistic guess above.
      if (filters.category === categoryId) return;
      applyCategoryAndSort({ category: categoryId, sort: filters.sort });
    },
  });

  gameCardsSection.setFilters(filters);

  main.append(filterSortSection, gameCardsSection.element, paginationSection.element);

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}
