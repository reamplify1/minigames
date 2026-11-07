import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { SnackbarService } from '../../core/snackbar.service';
import { DragScroll } from './drag-scroll';
import {
  CATEGORIES_URL,
  type CategoriesResponse,
  DEFAULT_SORT_ID,
  type FilterChip,
  parseCategories,
  resolveCategory,
  SORT_OPTIONS,
  type SortOption,
} from './filter-sort-section.data';

@Component({
  selector: 'app-filter-sort-section',
  imports: [DragScroll],
  templateUrl: './filter-sort-section.html',
  styleUrls: ['./filter-sort-section.scss', './filter-sort-section.states.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class FilterSortSection {
  readonly category = input.required<string>();
  readonly sort = input.required<string>();

  readonly categoryChange = output<string>();
  readonly sortChange = output<string>();
  readonly defaultCategoryChange = output<string>();

  private readonly snackbar: SnackbarService = inject(SnackbarService);

  private readonly sortDropdown = viewChild.required<ElementRef<HTMLElement>>('sortDropdown');
  private readonly sortTrigger = viewChild.required<ElementRef<HTMLElement>>('sortTrigger');

  protected readonly categories = httpResource<CategoriesResponse>((): string => CATEGORIES_URL);

  protected readonly chips = computed<FilterChip[]>((): FilterChip[] =>
    this.categories.hasValue() ? parseCategories(this.categories.value()) : []
  );

  protected readonly sortOptions: SortOption[] = SORT_OPTIONS;
  protected readonly skeletonChips: number[] = [1, 2, 3, 4, 5, 6];
  protected readonly isSortOpen = signal<boolean>(false);

  protected readonly sortLabel = computed<string>((): string => {
    const isKnown = this.sortOptions.some(
      (option: SortOption): boolean => option.id === this.sort()
    );
    const activeId = isKnown ? this.sort() : DEFAULT_SORT_ID;
    return (
      this.sortOptions.find((option: SortOption): boolean => option.id === activeId)?.label ?? ''
    );
  });

  constructor() {
    effect((): void => {
      const chips = this.chips();
      const category = this.category();
      const resolved = resolveCategory(category, chips);

      if (resolved && resolved !== category) {
        untracked((): void => {
          this.defaultCategoryChange.emit(resolved);
        });
      }
    });

    effect((): void => {
      if (this.categories.error()) {
        this.snackbar.show('Could not load categories.', 'error');
      }
    });
  }

  protected selectCategory(id: string): void {
    if (id !== this.category()) {
      this.categoryChange.emit(id);
    }
  }

  protected selectSort(id: string): void {
    if (id !== this.sort()) {
      this.sortChange.emit(id);
    }

    this.isSortOpen.set(false);
  }

  protected toggleSort(): void {
    this.isSortOpen.update((isOpen: boolean): boolean => !isOpen);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.sortDropdown().nativeElement.contains(event.target as Node)) {
      this.isSortOpen.set(false);
    }
  }

  protected onEscape(): void {
    if (this.isSortOpen()) {
      this.isSortOpen.set(false);
      this.sortTrigger().nativeElement.focus();
    }
  }
}
