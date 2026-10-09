import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Player } from './leaderboard.types';

const { fetchLeaderboardMock, showSnackbarMock } = vi.hoisted(() => ({
  fetchLeaderboardMock: vi.fn(),
  showSnackbarMock: vi.fn(),
}));

vi.mock('./leaderboard-data', () => ({ fetchLeaderboard: fetchLeaderboardMock }));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

import { createLeaderboard } from './leaderboard';

function buildPlayer(name: string): Player {
  return {
    initials: name.charAt(0),
    name,
    compactName: name,
    avatarColor: 'green',
    gamesPlayed: 42,
    score: '12,345',
    compactScore: '12.3K',
    streakDays: 7,
    favoriteGame: 'Tiny Glade',
  };
}

function getRows(section: HTMLElement): HTMLTableRowElement[] {
  return [...section.querySelectorAll<HTMLTableRowElement>('.leaderboard__row')];
}

describe('createLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton rows while the leaderboard is loading', () => {
    fetchLeaderboardMock.mockReturnValue(new Promise(() => {}));

    const section = createLeaderboard();

    expect(section.querySelectorAll('.leaderboard__row--skeleton')).toHaveLength(5);
  });

  it('renders one row per player with rank, name, score and streak', async () => {
    fetchLeaderboardMock.mockResolvedValue([buildPlayer('Ann'), buildPlayer('Bob')]);

    const section = createLeaderboard();

    await vi.waitFor(() => expect(getRows(section)).toHaveLength(2));
    const [firstRow] = getRows(section);
    expect(firstRow?.querySelector('.leaderboard__cell--rank')?.textContent).toBe('#1');
    expect(firstRow?.querySelector('.leaderboard__name')?.textContent).toContain('Ann');
    expect(firstRow?.querySelector('.leaderboard__cell--score')?.textContent).toContain('12,345');
    expect(firstRow?.querySelector('.leaderboard__cell--streak')?.textContent).toContain('7 days');
  });

  it('highlights first place and marks rows after the top three as extra', async () => {
    fetchLeaderboardMock.mockResolvedValue(
      ['Ann', 'Bob', 'Cid', 'Dan'].map((name) => buildPlayer(name))
    );

    const section = createLeaderboard();

    await vi.waitFor(() => expect(getRows(section)).toHaveLength(4));
    const rows = getRows(section);
    const ranks = rows.map((row) => row.querySelector('.leaderboard__cell--rank'));
    expect(ranks[0]?.classList.contains('leaderboard__cell--first-place')).toBe(true);
    expect(ranks[1]?.classList.contains('leaderboard__cell--first-place')).toBe(false);
    expect(rows.map((row) => row.classList.contains('leaderboard__row--extra'))).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it('shows the empty state when there are no players', async () => {
    fetchLeaderboardMock.mockResolvedValue([]);

    const section = createLeaderboard();

    await vi.waitFor(() => expect(section.querySelector('.leaderboard__empty')).not.toBeNull());
    expect(section.querySelector('table')).toBeNull();
  });

  it('shows an error with Retry, and loads the leaderboard again on Retry', async () => {
    fetchLeaderboardMock.mockRejectedValueOnce(new Error('Network error'));
    fetchLeaderboardMock.mockResolvedValueOnce([buildPlayer('Ann')]);

    const section = createLeaderboard();

    await vi.waitFor(() => expect(section.querySelector('.leaderboard__error')).not.toBeNull());
    expect(showSnackbarMock).toHaveBeenCalledWith('Could not load the leaderboard.', 'error');

    section.querySelector<HTMLButtonElement>(':scope .leaderboard__error button')?.click();

    await vi.waitFor(() => expect(getRows(section)).toHaveLength(1));
    expect(fetchLeaderboardMock).toHaveBeenCalledTimes(2);
  });
});
