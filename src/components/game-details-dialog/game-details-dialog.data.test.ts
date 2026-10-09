import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchJsonMock, postJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  postJsonMock: vi.fn(),
}));

vi.mock('../../utils/api', async () => {
  const actual = await vi.importActual<typeof import('../../utils/api')>('../../utils/api');
  return { ...actual, fetchJson: fetchJsonMock, postJson: postJsonMock };
});

import { ApiError } from '../../utils/api';
import { fetchGameDetails, toggleGameFavorite, formatLikes } from './game-details-dialog.data';
import { IMAGE_BY_SLUG, FALLBACK_IMAGE } from '../game-cards-section/games.data';

function buildApiGameDetails() {
  return {
    data: {
      slug: 'cozy-solitaire',
      name: 'Cozy Solitaire',
      heroImage: 'ignored.jpg',
      rating: 4.5,
      likesCount: 2500,
      isLikedByCurrentUser: true,
      fullDescription: 'A relaxing solitaire game.',
      specs: { genre: 'Card', players: '1', duration: '10 min', price: 'Free' },
      topRecords: [
        {
          position: 1,
          playerName: 'ForestDweller',
          score: 12_345,
          achievedAt: new Date().toISOString(),
        },
      ],
    },
  };
}

describe('fetchGameDetails', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
    postJsonMock.mockReset();
  });

  it('requests the game without a userEmail query when guest', async () => {
    fetchJsonMock.mockResolvedValue(buildApiGameDetails());

    await fetchGameDetails('cozy-solitaire');

    expect(fetchJsonMock).toHaveBeenCalledWith('/games/cozy-solitaire');
  });

  it('adds an encoded userEmail query when authenticated', async () => {
    fetchJsonMock.mockResolvedValue(buildApiGameDetails());

    await fetchGameDetails('cozy-solitaire', 'student+rs@school.com');

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/games/cozy-solitaire?userEmail=student%2Brs%40school.com'
    );
  });

  it('maps the API response into the shape the dialog renders', async () => {
    fetchJsonMock.mockResolvedValue(buildApiGameDetails());

    const result = await fetchGameDetails('cozy-solitaire');

    expect(result).toEqual({
      title: 'Cozy Solitaire',
      heroImage: IMAGE_BY_SLUG['cozy-solitaire'],
      rating: '4.5',
      likes: '2.5K',
      likesCount: 2500,
      isFavorited: true,
      description: 'A relaxing solitaire game.',
      info: [
        { label: 'Genre', value: 'Card' },
        { label: 'Players', value: '1' },
        { label: 'Duration', value: '10 min' },
        { label: 'Price', value: 'Free' },
      ],
      records: [{ player: 'ForestDweller', score: '12,345 pts', date: 'just now' }],
    });
  });

  it('falls back to the fallback image for a game with no known cover', async () => {
    const payload = buildApiGameDetails();
    payload.data.slug = 'unknown-slug';
    fetchJsonMock.mockResolvedValue(payload);

    const result = await fetchGameDetails('unknown-slug');

    expect(result?.heroImage).toBe(FALLBACK_IMAGE);
  });

  it('returns undefined for a 404 (unknown slug) instead of throwing', async () => {
    fetchJsonMock.mockRejectedValue(new ApiError('Request failed with status 404'));

    const result = await fetchGameDetails('missing-slug');

    expect(result).toBeUndefined();
  });

  it('rethrows any other error', async () => {
    fetchJsonMock.mockRejectedValue(new ApiError('Request failed with status 500'));

    await expect(fetchGameDetails('cozy-solitaire')).rejects.toThrow('500');
  });
});

describe('toggleGameFavorite', () => {
  beforeEach(() => {
    postJsonMock.mockReset();
  });

  it('posts to the game favorite endpoint with the user email and returns the result', async () => {
    postJsonMock.mockResolvedValue({ data: { isFavorited: true, likesCount: 2501 } });

    const result = await toggleGameFavorite('cozy-solitaire', 'student@rs.school');

    expect(postJsonMock).toHaveBeenCalledWith('/games/cozy-solitaire/favorite', {
      userEmail: 'student@rs.school',
    });
    expect(result).toEqual({ isFavorited: true, likesCount: 2501 });
  });
});

describe('formatLikes', () => {
  it('shows small counts as plain numbers', () => {
    expect(formatLikes(0)).toBe('0');
    expect(formatLikes(999)).toBe('999');
  });

  it('shows counts of 1000 and above abbreviated with one decimal and a K suffix', () => {
    expect(formatLikes(1000)).toBe('1.0K');
    expect(formatLikes(1500)).toBe('1.5K');
    expect(formatLikes(12_345)).toBe('12.3K');
  });
});
