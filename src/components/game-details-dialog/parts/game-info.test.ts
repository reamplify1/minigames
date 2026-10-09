import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GameDetails } from '../game-details-dialog.data';

const { getCurrentSessionMock, onAuthStateChangeMock, showSnackbarMock, toggleGameFavoriteMock } =
  vi.hoisted(() => ({
    getCurrentSessionMock: vi.fn(),
    onAuthStateChangeMock: vi.fn(),
    showSnackbarMock: vi.fn(),
    toggleGameFavoriteMock: vi.fn(),
  }));

vi.mock('../../../app/auth-state', () => ({
  getCurrentSession: getCurrentSessionMock,
  onAuthStateChange: onAuthStateChangeMock,
  checkSessionExpiration: vi.fn(),
}));

vi.mock('../../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

vi.mock('../game-details-dialog.data', async () => {
  const actual = await vi.importActual<typeof import('../game-details-dialog.data')>(
    '../game-details-dialog.data'
  );
  return { ...actual, toggleGameFavorite: toggleGameFavoriteMock };
});

import { createGameInfo } from './game-info';

function buildGame(isFavorited: boolean): GameDetails {
  return {
    title: 'Cozy Solitaire',
    heroImage: 'ignored.jpg',
    rating: '4.5',
    likes: '500',
    likesCount: 500,
    isFavorited,
    description: 'A relaxing solitaire game.',
    info: [],
    records: [],
  };
}

function mountGameInfo(isFavorited = false): HTMLButtonElement {
  document.body.replaceChildren(createGameInfo(buildGame(isFavorited), 'cozy-solitaire'));

  return document.querySelector('.game-details-dialog__favorite') as HTMLButtonElement;
}

describe('createGameInfo favorite toggle', () => {
  beforeEach(() => {
    getCurrentSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    showSnackbarMock.mockClear();
    toggleGameFavoriteMock.mockReset();
  });

  it('renders the initial favorite state from the game details', () => {
    const button = mountGameInfo(true);

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Remove from Favorites');
  });

  it('does not call the API for a guest, and shows the guest message instead', () => {
    getCurrentSessionMock.mockReturnValue(undefined);
    const button = mountGameInfo(false);

    button.click();

    expect(toggleGameFavoriteMock).not.toHaveBeenCalled();
    expect(showSnackbarMock).toHaveBeenCalledWith(
      'Log in to add games to your favorites.',
      'error'
    );
  });

  it('toggles the favorite state and the likes count on a successful request', async () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });
    toggleGameFavoriteMock.mockResolvedValue({ isFavorited: true, likesCount: 501 });
    const button = mountGameInfo(false);

    button.click();
    await vi.waitFor(() => expect(toggleGameFavoriteMock).toHaveBeenCalled());

    expect(toggleGameFavoriteMock).toHaveBeenCalledWith('cozy-solitaire', 'student@rs.school');
    await vi.waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('true'));

    expect(button.querySelector('.game-details-dialog__favorite-label')?.textContent).toBe(
      'Remove from Favorites'
    );
    expect(document.querySelector('.game-details-dialog__stat-likes')?.textContent).toBe('501');
    expect(button.disabled).toBe(false);
  });

  it('shows an error message and leaves the state unchanged when the request fails', async () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });
    toggleGameFavoriteMock.mockRejectedValue(new Error('network error'));
    const button = mountGameInfo(false);

    button.click();
    await vi.waitFor(() => expect(showSnackbarMock).toHaveBeenCalled());

    expect(showSnackbarMock).toHaveBeenCalledWith(
      'Could not update favorites. Please try again.',
      'error'
    );
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.disabled).toBe(false);
  });

  it('ignores a repeat click while a request is already in flight', () => {
    getCurrentSessionMock.mockReturnValue({ email: 'student@rs.school' });
    // Never resolves — this test only cares that a second click is ignored
    // while the first request is still pending, not about its eventual
    // outcome (covered separately by the success/failure tests above).
    toggleGameFavoriteMock.mockReturnValue(new Promise(() => {}));
    const button = mountGameInfo(false);

    button.click();
    expect(button.disabled).toBe(true);

    button.click();
    expect(toggleGameFavoriteMock).toHaveBeenCalledTimes(1);
  });
});
