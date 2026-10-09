import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchJsonMock } = vi.hoisted(() => ({ fetchJsonMock: vi.fn() }));

vi.mock('../../utils/api', () => ({ fetchJson: fetchJsonMock }));

import { fetchLeaderboard } from './leaderboard-data';

interface ApiPlayerOverrides {
  rank?: number;
  playerName?: string;
  totalScore?: number;
}

function buildApiPlayer(overrides: ApiPlayerOverrides = {}) {
  return {
    rank: overrides.rank ?? 1,
    playerName: overrides.playerName ?? 'ForestDweller',
    gamesPlayed: 42,
    totalScore: overrides.totalScore ?? 12_345,
    streakDays: 7,
    favoriteGameName: 'Tiny Glade',
  };
}

describe('fetchLeaderboard', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it('requests the leaderboard endpoint and maps each player', async () => {
    fetchJsonMock.mockResolvedValue({ data: [buildApiPlayer()] });

    const players = await fetchLeaderboard();

    expect(fetchJsonMock).toHaveBeenCalledWith('/leaderboard');
    expect(players[0]).toEqual({
      initials: 'FD',
      name: 'ForestDweller',
      compactName: 'ForestDweller',
      avatarColor: 'yellow',
      gamesPlayed: 42,
      score: '12,345',
      compactScore: '12.3K',
      streakDays: 7,
      favoriteGame: 'Tiny Glade',
    });
  });

  it('builds initials from camelCase and snake_case names', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiPlayer({ playerName: 'cozy_gamer' }), buildApiPlayer({ playerName: 'pixel' })],
    });

    const players = await fetchLeaderboard();

    expect(players.map((player) => player.initials)).toEqual(['CG', 'P']);
  });

  it('shows scores under 1000 without the K suffix', async () => {
    fetchJsonMock.mockResolvedValue({ data: [buildApiPlayer({ totalScore: 999 })] });

    const players = await fetchLeaderboard();

    expect(players[0]?.compactScore).toBe('999');
  });

  it('cycles avatar colors by rank', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [buildApiPlayer({ rank: 1 }), buildApiPlayer({ rank: 2 }), buildApiPlayer({ rank: 6 })],
    });

    const players = await fetchLeaderboard();

    expect(players.map((player) => player.avatarColor)).toEqual(['yellow', 'green', 'yellow']);
  });
});
