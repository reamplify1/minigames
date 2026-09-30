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

export function renderLibraryPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';

  // Optimistic default (matches the API's own default category) so the
  // games list can load right away, without waiting for the categories
  // request to finish.
  const filters: GameFilters = {
    category: FALLBACK_CATEGORY_ID,
    sort: DEFAULT_SORT_ID,
  };

  const gameCardsSection = createGameCardsSection();

  const filterSortSection = createFilterSortSection({
    onFilterChange: (categoryId) => {
      filters.category = categoryId;
      gameCardsSection.setFilters(filters);
    },
    onSortChange: (sortId) => {
      filters.sort = sortId;
      gameCardsSection.setFilters(filters);
    },
    onDefaultCategoryChange: (categoryId) => {
      // Only refetch if the API's real default turned out to differ from
      // the optimistic guess above.
      if (filters.category === categoryId) return;
      filters.category = categoryId;
      gameCardsSection.setFilters(filters);
    },
  });

  gameCardsSection.setFilters(filters);

  const paginationSection = createPaginationSection();

  main.append(filterSortSection, gameCardsSection.element, paginationSection);

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}
