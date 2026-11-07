import { Component, computed, inject, type Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FilterSortSection } from '../../components/filter-sort-section/filter-sort-section';
import {
  DEFAULT_SORT_ID,
  FALLBACK_CATEGORY_ID,
} from '../../components/filter-sort-section/filter-sort-section.data';
import { GameCardsSection } from '../../components/game-cards-section/game-cards-section';
import type { GameFilters, GamesMeta } from '../../components/game-cards-section/games.data';
import { PaginationSection } from '../../components/pagination-section/pagination-section';

const FIRST_PAGE: number = 1;

export function parseFilters(params: ParamMap): GameFilters {
  const page = Number(params.get('page'));

  return {
    category: params.get('category') ?? FALLBACK_CATEGORY_ID,
    sort: params.get('sort') ?? DEFAULT_SORT_ID,
    page: Number.isSafeInteger(page) && page > 0 ? page : FIRST_PAGE,
  };
}

export function toQueryParams(filters: GameFilters): Record<string, string | number | null> {
  return {
    category: filters.category === FALLBACK_CATEGORY_ID ? null : filters.category,
    sort: filters.sort === DEFAULT_SORT_ID ? null : filters.sort,
    page: filters.page === FIRST_PAGE ? null : filters.page,
  };
}

function areFiltersEqual(a: GameFilters, b: GameFilters): boolean {
  return a.category === b.category && a.sort === b.sort && a.page === b.page;
}

@Component({
  selector: 'app-library-page',
  imports: [FilterSortSection, GameCardsSection, PaginationSection],
  template: `
    <main class="library-page">
      <app-filter-sort-section
        [category]="filters().category"
        [sort]="filters().sort"
        (categoryChange)="applyFilters({ category: $event, page: 1 })"
        (sortChange)="applyFilters({ sort: $event, page: 1 })"
        (defaultCategoryChange)="applyFilters({ category: $event }, true)"
      />
      <app-game-cards-section [filters]="filters()" (metaChange)="meta.set($event)" />
      <app-pagination-section
        [page]="meta().page"
        [totalPages]="meta().totalPages"
        (pageChange)="applyFilters({ page: $event })"
      />
    </main>
  `,
})
export class LibraryPage {
  private readonly router: Router = inject(Router);
  private readonly queryParams: Signal<ParamMap> = toSignal(inject(ActivatedRoute).queryParamMap, {
    requireSync: true,
  });

  protected readonly filters = computed<GameFilters>(
    (): GameFilters => parseFilters(this.queryParams()),
    {
      equal: areFiltersEqual,
    }
  );

  protected readonly meta = signal<GamesMeta>({
    page: FIRST_PAGE,
    totalPages: 1,
  });

  protected applyFilters(changes: Partial<GameFilters>, replaceUrl: boolean = false): void {
    void this.router.navigate([], {
      queryParams: toQueryParams({ ...this.filters(), ...changes }),
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
