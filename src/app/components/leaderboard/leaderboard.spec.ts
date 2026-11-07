import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnackbarService } from '../../core/snackbar.service';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { Leaderboard } from './leaderboard';
import { LEADERBOARD_URL, type LeaderboardResponse, parseLeaderboard } from './leaderboard.data';

const API_PLAYERS: LeaderboardResponse = {
  data: [1, 2, 3, 4].map((rank) => ({
    rank,
    playerName: `Cozy_Gamer${rank}`,
    gamesPlayed: 10 * rank,
    totalScore: 12_345 * rank,
    streakDays: rank,
    favoriteGameName: 'Palia',
  })),
};

describe('parseLeaderboard', () => {
  it('builds initials and formatted scores', () => {
    expect(parseLeaderboard(API_PLAYERS)[0]).toMatchObject({
      initials: 'CG',
      score: '12,345',
      compactScore: '12.3K',
      avatarColor: 'yellow',
    });
  });
});

describe('Leaderboard', () => {
  let fixture: ComponentFixture<Leaderboard>;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Leaderboard);
    await settle();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('shows skeleton rows while loading', () => {
    expect(element().querySelectorAll('.leaderboard__row--skeleton')).toHaveLength(5);
  });

  it('shows the players and marks extra rows for small screens', async () => {
    http.expectOne(LEADERBOARD_URL).flush(API_PLAYERS);
    await settle();

    expect(element().querySelectorAll('.leaderboard__row')).toHaveLength(4);
    expect(element().querySelectorAll('.leaderboard__row--extra')).toHaveLength(1);
    expect(element().querySelector('.leaderboard__cell--first-place')?.textContent).toContain('#1');
  });

  it('shows the empty state', async () => {
    http.expectOne(LEADERBOARD_URL).flush({ data: [] });
    await settle();
    expect(element().querySelector('.leaderboard__empty')).not.toBeNull();
  });

  it('shows an error and a snackbar when loading fails', async () => {
    http.expectOne(LEADERBOARD_URL).flush('', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(element().querySelector('.leaderboard__error')).not.toBeNull();
    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toBe(
      'Could not load the leaderboard.'
    );
  });
});
