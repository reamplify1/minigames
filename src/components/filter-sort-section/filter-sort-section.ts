import './filter-sort-section.scss';
import {
  fetchFilterChips,
  FALLBACK_CATEGORY_ID,
  SORT_OPTIONS,
  DEFAULT_SORT_ID,
  type FilterChip,
} from './filter-sort-section.data';
import arrowDropDownIcon from '../../assets/icons/arrow-drop-down-icon.svg';
import checkIcon from '../../assets/icons/check-icon.svg';
import { enableDragScroll } from './drag-scroll';
import {
  createChipsSkeleton,
  createChipsErrorBanner,
  createChipsEmptyState,
  createChipsList,
  CHIPS_SLOT_SELECTOR,
} from './filter-sort-section.states';
import { showSnackbar } from '../snackbar/snackbar';

const SORT_LIST_ID = 'sort-options';
const CHIPS_SKELETON_COUNT = 6;

export interface FilterSortSectionOptions {
  // Category/sort the URL already asked for when the section is created
  // (a deep link or a Back/Forward move) — used instead of the API's own
  // default so a restored page doesn't flash the wrong chip.
  initialFilter?: string;
  initialSort?: string;
  onFilterChange?: (filterId: string) => void;
  onSortChange?: (sortId: string) => void;
  // Called once the categories load and the real default category is known
  // (it may differ from the FALLBACK_CATEGORY_ID guess used before that, or
  // from an initialFilter that turned out not to exist).
  onDefaultCategoryChange?: (filterId: string) => void;
}

export interface FilterSortSection {
  element: HTMLElement;
  // Re-syncs the visible chip/sort selection with external state (the URL),
  // without re-triggering onFilterChange/onSortChange — used when History
  // navigation restores a different category/sort than what's on screen.
  setActiveFilter: (filterId: string) => void;
  setActiveSort: (sortId: string) => void;
}

interface SortEntry {
  item: HTMLLIElement;
  button: HTMLButtonElement;
}

function isKnownSort(sortId: string | undefined): sortId is string {
  return sortId !== undefined && SORT_OPTIONS.some((option) => option.id === sortId);
}

export function createFilterSortSection(options: FilterSortSectionOptions = {}): FilterSortSection {
  let activeFilter = options.initialFilter ?? FALLBACK_CATEGORY_ID;
  let activeSort = isKnownSort(options.initialSort) ? options.initialSort : DEFAULT_SORT_ID;

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

  const chipButtons = new Map<string, HTMLButtonElement>();

  function setActiveFilter(filterId: string): void {
    if (activeFilter === filterId) return;
    chipButtons.get(activeFilter)?.classList.remove('chip--active');
    chipButtons.get(activeFilter)?.setAttribute('aria-pressed', 'false');
    activeFilter = filterId;
    chipButtons.get(activeFilter)?.classList.add('chip--active');
    chipButtons.get(activeFilter)?.setAttribute('aria-pressed', 'true');
  }

  function createChipItem(chip: FilterChip): HTMLLIElement {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = chip.label;
    button.setAttribute('aria-pressed', String(chip.id === activeFilter));
    if (chip.id === activeFilter) button.classList.add('chip--active');

    button.addEventListener('click', () => {
      if (activeFilter === chip.id) return;
      setActiveFilter(chip.id);
      options.onFilterChange?.(activeFilter);
    });

    chipButtons.set(chip.id, button);
    li.append(button);
    return li;
  }

  const loadChips = async (): Promise<void> => {
    bar.querySelector(CHIPS_SLOT_SELECTOR)?.replaceWith(createChipsSkeleton(CHIPS_SKELETON_COUNT));

    try {
      const chips = await fetchFilterChips();

      if (chips.length === 0) {
        bar.querySelector(CHIPS_SLOT_SELECTOR)?.replaceWith(createChipsEmptyState());
        return;
      }

      chipButtons.clear();

      const requestedFilter = options.initialFilter;
      const isRequestedFilterKnown =
        requestedFilter !== undefined && chips.some((chip) => chip.id === requestedFilter);
      activeFilter = isRequestedFilterKnown
        ? requestedFilter
        : (chips.find((chip) => chip.isDefault)?.id ?? chips[0].id);

      const list = createChipsList();
      for (const chip of chips) {
        list.append(createChipItem(chip));
      }

      bar.querySelector(CHIPS_SLOT_SELECTOR)?.replaceWith(list);
      enableDragScroll(list);
      options.onDefaultCategoryChange?.(activeFilter);
    } catch {
      bar.querySelector(CHIPS_SLOT_SELECTOR)?.replaceWith(createChipsErrorBanner(loadChips));
      showSnackbar('Could not load categories.', 'error');
    }
  };

  bar.append(createChipsSkeleton(CHIPS_SKELETON_COUNT));
  void loadChips();

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

  function setActiveSort(sortId: string): void {
    if (activeSort === sortId || !isKnownSort(sortId)) return;
    markSelected(activeSort, false);
    activeSort = sortId;
    markSelected(activeSort, true);
    setSortLabel(activeSort);
  }

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
        setActiveSort(option.id);
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
  bar.append(sortWrapper);
  section.append(intro, bar);

  return { element: section, setActiveFilter, setActiveSort };
}
