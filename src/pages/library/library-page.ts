import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';
import { createFilterSortSection } from '../../components/filter-sort-section/filter-sort-section';

export function renderLibraryPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';

  const filterSortSection = createFilterSortSection({
    onFilterChange: (filterId) => {
      // TODO: подключить фильтрацию карточек игр, когда будет готова секция Game Cards 
      console.log('filter changed:', filterId);
    },
    onSortChange: (sortId) => {
      // TODO: подключить сортировку карточек игр
      console.log('sort changed:', sortId);
    },
  });

  main.append(filterSortSection);

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}