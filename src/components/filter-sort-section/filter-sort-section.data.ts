import { fetchJson } from '../../utils/api';

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

interface CategoriesResponse {
  data: ApiCategory[];
}

export const FALLBACK_CATEGORY_ID = 'all';

export async function fetchFilterChips(): Promise<FilterChip[]> {
  const response = await fetchJson<CategoriesResponse>('/categories');
  return response.data.map((category) => ({
    id: category.slug,
    label: category.label,
    isDefault: category.isDefault,
  }));
}

export interface SortOption {
  id: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'rating-asc', label: 'Rating ↑' },
  { id: 'rating-desc', label: 'Rating ↓' },
  { id: 'name-asc', label: 'Name A→Z' },
  { id: 'name-desc', label: 'Name Z→A' },
];

export const DEFAULT_SORT_ID = 'rating-desc';
