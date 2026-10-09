import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }));

vi.mock('../../utils/api', () => ({ fetchJson: fetchJsonMock }));

import { fetchFeaturedGames } from './new-games.data';

function buildApiGame(slug: string, likesCount = 500) {
  return { slug, name: 'Some Game', rating: 4.5, likesCount };
}

describe('fetchFeaturedGames', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it('requests only featured games', async () => {
    fetchJsonMock.mockResolvedValue({ data: [] });

    await fetchFeaturedGames();

    expect(fetchJsonMock).toHaveBeenCalledWith('/games?featured=true');
  });

  it('maps each game into the card shape', async () => {
    fetchJsonMock.mockResolvedValue({ data: [buildApiGame('tiny-glade')] });

    const [game] = await fetchFeaturedGames();

    expect(game?.slug).toBe('tiny-glade');
    expect(game?.title).toBe('Some Game');
    expect(game?.rating).toBe(4.5);
    expect(game?.likes).toBe('500');
  });

  it('abbreviates likes counts of 1000 and above', async () => {
    fetchJsonMock.mockResolvedValue({ data: [buildApiGame('tiny-glade', 2500)] });

    const [game] = await fetchFeaturedGames();

    expect(game?.likes).toBe('2.5K');
  });

  it('uses the fallback image for a game with no local cover', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiGame('unknown-game'), buildApiGame('vacation-cafe-simulator')],
    });

    const [unknownGame, fallbackGame] = await fetchFeaturedGames();

    expect(unknownGame?.image).toBe(fallbackGame?.image);
  });

  it('gives each known game its own cover image', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiGame('tiny-glade'), buildApiGame('palia')],
    });

    const [tinyGlade, palia] = await fetchFeaturedGames();

    expect(tinyGlade?.image).not.toBe(palia?.image);
  });
});
