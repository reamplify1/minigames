import { apiUrl } from '../../core/api';

export interface FilterChip {
  id: string;
  label: string;
  isDefault: boolean;
}

interface ApiCategory {
  slug: string;
  label: string;
  isDefault: boolean;
}

export interface CategoriesResponse {
  data: ApiCategory[];
}

export interface SortOption {
  id: string;
  label: string;
}

export const CATEGORIES_URL: string = apiUrl('/categories');
export const FALLBACK_CATEGORY_ID: string = 'all';
export const DEFAULT_SORT_ID: string = 'rating-desc';

export const SORT_OPTIONS: SortOption[] = [
  { id: 'rating-asc', label: 'Rating ↑' },
  { id: 'rating-desc', label: 'Rating ↓' },
  { id: 'name-asc', label: 'Name A→Z' },
  { id: 'name-desc', label: 'Name Z→A' },
];

export function parseCategories(response: CategoriesResponse): FilterChip[] {
  return response.data.map((category: ApiCategory): FilterChip => ({
    id: category.slug,
    label: category.label,
    isDefault: category.isDefault,
  }));
}

export function resolveCategory(requested: string, chips: FilterChip[]): string | undefined {
  if (chips.some((chip: FilterChip): boolean => chip.id === requested)) {
    return requested;
  }

  return chips.find((chip: FilterChip): boolean => chip.isDefault)?.id ?? chips[0]?.id;
}
