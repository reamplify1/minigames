import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';
import { createFilterSortSection } from '../../components/filter-sort-section/filter-sort-section';
import { createGameCardsSection } from '../../components/game-cards-section/game-cards-section';
import { createPaginationSection } from '../../components/pagination-section/pagination-section';

export function renderLibraryPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';

  const filterSortSection = createFilterSortSection({
    onFilterChange: () => {
      // TODO: подключить фильтрацию карточек игр
    },
    onSortChange: () => {
      // TODO: подключить сортировку карточек игр
    },
  });

  const gameCardsSection = createGameCardsSection();
  const paginationSection = createPaginationSection();

  main.append(filterSortSection, gameCardsSection, paginationSection);

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}
