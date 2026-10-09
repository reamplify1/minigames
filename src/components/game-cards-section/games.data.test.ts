import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }));

vi.mock('../../utils/api', () => ({ fetchJson: fetchJsonMock }));

import { fetchLibraryGames, IMAGE_BY_SLUG, FALLBACK_IMAGE } from './games.data';

interface ApiGameOverrides {
  slug?: string;
  category?: string;
  likesCount?: number;
}

function buildApiGame(overrides: ApiGameOverrides = {}) {
  return {
    slug: overrides.slug ?? 'cozy-solitaire',
    name: 'Cozy Solitaire',
    category: overrides.category ?? 'card',
    price: 'Free',
    shortDescription: 'A relaxing solitaire game.',
    rating: 4.5,
    likesCount: overrides.likesCount ?? 500,
  };
}

describe('fetchLibraryGames', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it('builds the query string from the given filters, with a fixed page size', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], meta: { page: 2, totalPages: 5 } });

    await fetchLibraryGames({ category: 'puzzle', sort: 'popular', page: 2 });

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/games?category=puzzle&sort=popular&page=2&limit=6'
    );
  });

  it('maps each game and capitalizes its category into a genre label', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiGame({ category: 'puzzle' })],
      meta: { page: 1, totalPages: 1 },
    });

    const result = await fetchLibraryGames({ category: 'puzzle', sort: 'new', page: 1 });

    expect(result.games[0]).toEqual({
      id: 'cozy-solitaire',
      title: 'Cozy Solitaire',
      genre: 'Puzzle',
      price: 'Free',
      description: 'A relaxing solitaire game.',
      rating: 4.5,
      likes: '500',
      cover: IMAGE_BY_SLUG['cozy-solitaire'],
    });
  });

  it('abbreviates likes counts of 1000 and above', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiGame({ likesCount: 12_345 })],
      meta: { page: 1, totalPages: 1 },
    });

    const result = await fetchLibraryGames({ category: 'all', sort: 'new', page: 1 });

    expect(result.games[0]?.likes).toBe('12.3K');
  });

  it('falls back to the fallback cover image for a slug with no known image', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiGame({ slug: 'some-unlisted-game' })],
      meta: { page: 1, totalPages: 1 },
    });

    const result = await fetchLibraryGames({ category: 'all', sort: 'new', page: 1 });

    expect(result.games[0]?.cover).toBe(FALLBACK_IMAGE);
  });

  it('passes through the pagination meta untouched', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], meta: { page: 3, totalPages: 7 } });

    const result = await fetchLibraryGames({ category: 'all', sort: 'new', page: 3 });

    expect(result.meta).toEqual({ page: 3, totalPages: 7 });
  });
});
