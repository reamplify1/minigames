import './filter-sort-section.scss';
import { FILTER_CHIPS, SORT_OPTIONS, DEFAULT_SORT_ID } from './filter-sort-section.data';

export interface FilterSortSectionOptions {
  onFilterChange?: (filterId: string) => void;
  onSortChange?: (sortId: string) => void;
}

export function createFilterSortSection(options: FilterSortSectionOptions = {}): HTMLElement {
  let activeFilter = 'all';
  let activeSort = DEFAULT_SORT_ID;

  const section = document.createElement('section');
  section.className = 'filter-sort-section';
  section.setAttribute('aria-labelledby', 'library-title');

  // --- Title block ---
  const intro = document.createElement('div');
  intro.className = 'filter-sort-section__intro';

  const title = document.createElement('h1');
  title.id = 'library-title';
  title.className = 'filter-sort-section__title';
  title.textContent = 'Game Library';

  const subtitle = document.createElement('p');
  subtitle.className = 'filter-sort-section__subtitle';
  subtitle.textContent = 'Browse our collection of casual mini-games';

  intro.append(title, subtitle);

  // --- Filter Sort Bar ---
  const bar = document.createElement('div');
  bar.className = 'filter-sort-bar';

  const chipsList = document.createElement('ul');
  chipsList.className = 'filter-sort-bar__chips';
  chipsList.setAttribute('role', 'list');

  const chipButtons = new Map<string, HTMLButtonElement>();

  for (const chip of FILTER_CHIPS) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = chip.label;
    button.setAttribute('aria-pressed', String(chip.id === activeFilter));
    if (chip.id === activeFilter) button.classList.add('chip--active');

    button.addEventListener('click', () => {
      if (activeFilter === chip.id) return;
      chipButtons.get(activeFilter)?.classList.remove('chip--active');
      chipButtons.get(activeFilter)?.setAttribute('aria-pressed', 'false');
      activeFilter = chip.id;
      button.classList.add('chip--active');
      button.setAttribute('aria-pressed', 'true');
      options.onFilterChange?.(activeFilter);
    });

    chipButtons.set(chip.id, button);
    li.append(button);
    chipsList.append(li);
  }

  // --- Sort dropdown ---
  const sortWrapper = document.createElement('div');
  sortWrapper.className = 'filter-sort-bar__sort sort-dropdown';

  const sortTrigger = document.createElement('button');
  sortTrigger.type = 'button';
  sortTrigger.className = 'sort-trigger';
  sortTrigger.setAttribute('aria-haspopup', 'listbox');
  sortTrigger.setAttribute('aria-expanded', 'false');

  const sortLabel = document.createElement('span');
  const setSortLabel = (id: string) => {
    const option = SORT_OPTIONS.find((o) => o.id === id);
    sortLabel.textContent = `Sort by: ${option?.label ?? ''}`;
  };
  setSortLabel(activeSort);

  const chevron = document.createElement('span');
  chevron.className = 'sort-trigger__chevron';
  chevron.setAttribute('aria-hidden', 'true');

  sortTrigger.append(sortLabel, chevron);

  const sortList = document.createElement('ul');
  sortList.className = 'sort-dropdown__options';
  sortList.setAttribute('role', 'listbox');
  sortList.hidden = true;

  for (const option of SORT_OPTIONS) {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(option.id === activeSort));

    const optButton = document.createElement('button');
    optButton.type = 'button';
    optButton.textContent = option.label;

    optButton.addEventListener('click', () => {
      activeSort = option.id;
      setSortLabel(activeSort);
      for (const item of sortList.querySelectorAll('li')) {
        item.setAttribute('aria-selected', 'false');
      }
      li.setAttribute('aria-selected', 'true');
      closeDropdown();
      options.onSortChange?.(activeSort);
    });

    li.append(optButton);
    sortList.append(li);
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (!sortWrapper.contains(event.target as Node)) closeDropdown();
  };

  const openDropdown = () => {
    sortList.hidden = false;
    sortTrigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', handleOutsideClick);
  };

  const closeDropdown = () => {
    sortList.hidden = true;
    sortTrigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick);
  };

  sortTrigger.addEventListener('click', () => {
    if (sortList.hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  sortWrapper.append(sortTrigger, sortList);
  bar.append(chipsList, sortWrapper);
  section.append(intro, bar);

  return section;
}