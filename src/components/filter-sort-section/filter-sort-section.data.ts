export interface FilterChip {
  id: string;
  label: string;
}

export const FILTER_CHIPS: FilterChip[] = [
  { id: 'all', label: 'All Games' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'card', label: 'Card' },
  { id: 'match', label: 'Match' },
  { id: 'farm', label: 'Farm' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'arcade', label: 'Arcade' },
];

export interface SortOption {
  id: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'rating', label: 'Rating' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'newest', label: 'Newest' },
  { id: 'price', label: 'Price' },
];

export const DEFAULT_SORT_ID = 'rating';