import './filter-sort-section.scss';
import { FILTER_CHIPS, SORT_OPTIONS, DEFAULT_SORT_ID } from './filter-sort-section.data';
import arrowDropDownIcon from '../../assets/icons/arrow-drop-down-icon.svg';
import checkIcon from '../../assets/icons/check-icon.svg';
import { enableDragScroll } from './drag-scroll';

const SORT_LIST_ID = 'sort-options';

export interface FilterSortSectionOptions {
  onFilterChange?: (filterId: string) => void;
  onSortChange?: (sortId: string) => void;
}

interface SortEntry {
  item: HTMLLIElement;
  button: HTMLButtonElement;
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

  enableDragScroll(chipsList);

  // --- Sort dropdown ---
  const sortWrapper = document.createElement('div');
  sortWrapper.className = 'filter-sort-bar__sort sort-dropdown';

  const sortTrigger = document.createElement('button');
  sortTrigger.type = 'button';
  sortTrigger.className = 'sort-trigger';
  sortTrigger.setAttribute('aria-haspopup', 'true');
  sortTrigger.setAttribute('aria-expanded', 'false');
  sortTrigger.setAttribute('aria-controls', SORT_LIST_ID);

  const sortLabel = document.createElement('span');
  const setSortLabel = (id: string): void => {
    const option = SORT_OPTIONS.find((o) => o.id === id);
    sortLabel.textContent = `Sort by: ${option?.label ?? ''}`;
  };
  setSortLabel(activeSort);

  const chevron = document.createElement('img');
  chevron.className = 'sort-trigger__chevron';
  chevron.src = arrowDropDownIcon;
  chevron.alt = '';
  chevron.setAttribute('aria-hidden', 'true');

  sortTrigger.append(sortLabel, chevron);

  const sortList = document.createElement('ul');
  sortList.id = SORT_LIST_ID;
  sortList.className = 'sort-dropdown__options';
  sortList.hidden = true;

  const sortEntries = new Map<string, SortEntry>();

  const markSelected = (id: string, isSelected: boolean): void => {
    const entry = sortEntries.get(id);
    if (!entry) return;
    entry.item.classList.toggle('sort-dropdown__item--selected', isSelected);
    entry.button.classList.toggle('sort-dropdown__option--selected', isSelected);
    entry.button.setAttribute('aria-current', String(isSelected));
  };

  const handleOutsideClick = (event: MouseEvent): void => {
    if (!sortWrapper.contains(event.target as Node)) closeDropdown();
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    closeDropdown();
    sortTrigger.focus();
  };

  const openDropdown = (): void => {
    sortList.hidden = false;
    sortTrigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
  };

  const closeDropdown = (): void => {
    sortList.hidden = true;
    sortTrigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydown);
  };

  for (const option of SORT_OPTIONS) {
    const item = document.createElement('li');
    item.className = 'sort-dropdown__item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sort-dropdown__option';

    const check = document.createElement('img');
    check.className = 'sort-dropdown__check';
    check.src = checkIcon;
    check.alt = '';
    check.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = option.label;

    button.append(check, label);

    button.addEventListener('click', () => {
      if (option.id !== activeSort) {
        markSelected(activeSort, false);
        activeSort = option.id;
        markSelected(activeSort, true);
        setSortLabel(activeSort);
        options.onSortChange?.(activeSort);
      }
      closeDropdown();
    });

    sortEntries.set(option.id, { item, button });
    item.append(button);
    sortList.append(item);
  }

  markSelected(activeSort, true);

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
