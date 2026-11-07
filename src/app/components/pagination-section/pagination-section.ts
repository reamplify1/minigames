import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

const MOBILE_QUERY: string = '(max-width: 767px)';
const MAX_VISIBLE_DESKTOP: number = 4;
const MAX_VISIBLE_MOBILE: number = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): number[] {
  const visibleCount = Math.min(maxVisible, totalPages);
  const start = clamp(
    currentPage - Math.floor((visibleCount - 1) / 2),
    1,
    totalPages - visibleCount + 1
  );

  return Array.from({ length: visibleCount }, (_: unknown, index: number): number => start + index);
}

@Component({
  selector: 'app-pagination-section',
  templateUrl: './pagination-section.html',
  styleUrl: './pagination-section.scss',
})
export class PaginationSection {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  private readonly pagesList = viewChild.required<ElementRef<HTMLElement>>('pagesList');

  private readonly isMobile = signal<boolean>(false);

  protected readonly lastPage = computed<number>((): number => Math.max(1, this.totalPages()));
  protected readonly currentPage = computed<number>((): number =>
    clamp(this.page(), 1, this.lastPage())
  );

  protected readonly visiblePages = computed<number[]>((): number[] =>
    getVisiblePages(
      this.currentPage(),
      this.lastPage(),
      this.isMobile() ? MAX_VISIBLE_MOBILE : MAX_VISIBLE_DESKTOP
    )
  );

  constructor() {
    const mobileQuery = globalThis.matchMedia(MOBILE_QUERY);
    const updateIsMobile = (): void => {
      this.isMobile.set(mobileQuery.matches);
    };

    updateIsMobile();
    mobileQuery.addEventListener('change', updateIsMobile);
    inject(DestroyRef).onDestroy((): void => {
      mobileQuery.removeEventListener('change', updateIsMobile);
    });

    afterRenderEffect((): void => {
      this.currentPage();

      const list = this.pagesList().nativeElement;

      if (list.contains(document.activeElement)) {
        list.querySelector<HTMLElement>('.pagination__page--active')?.focus();
      }
    });
  }

  protected goToPage(page: number): void {
    if (page !== this.currentPage() && page >= 1 && page <= this.lastPage()) {
      this.pageChange.emit(page);
    }
  }
}
