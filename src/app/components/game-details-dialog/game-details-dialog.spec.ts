import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { apiUrl } from '../../core/api';
import { SnackbarService } from '../../core/snackbar.service';
import {
  createFakeFirebase,
  provideTestApp,
  storeSession,
  settle,
} from '../../testing/test-helpers';
import { GameDetailsDialog } from './game-details-dialog';
import {
  type GameDetailsResponse,
  getGameDetailsUrl,
  parseGameDetails,
} from './game-details-dialog.data';
import { type CommentsResponse, getCommentsUrl } from './parts/game-comments.data';

const API_GAME: GameDetailsResponse = {
  data: {
    slug: 'palia',
    name: 'Palia',
    rating: 4.8,
    likesCount: 1500,
    isLikedByCurrentUser: true,
    fullDescription: 'Cozy life',
    specs: { genre: 'Sim', players: 'Solo', duration: '1h', price: 'Free' },
    topRecords: [
      { position: 1, playerName: 'Ann', score: 1234, achievedAt: new Date().toISOString() },
    ],
  },
};

const API_COMMENTS: CommentsResponse = {
  data: [
    {
      commentId: 'c1',
      authorName: 'Ann',
      text: '<b>Lovely</b>',
      likesCount: 2,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    },
  ],
  meta: { totalComments: 7 },
};

describe('parseGameDetails', () => {
  it('builds the info list and the records', () => {
    const game = parseGameDetails(API_GAME);

    expect(game.info.map((item) => item.label)).toEqual(['Genre', 'Players', 'Duration', 'Price']);
    expect(game.records[0]).toMatchObject({ player: 'Ann', score: '1,234 pts' });
  });
});

describe('GameDetailsDialog', () => {
  let fixture: ComponentFixture<GameDetailsDialog>;
  let http: HttpTestingController;

  async function setup(): Promise<void> {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GameDetailsDialog);
    fixture.componentRef.setInput('slug', 'palia');
    await settle();
  }

  async function respondWithGame(email?: string): Promise<void> {
    http.expectOne(getGameDetailsUrl('palia', email)).flush(API_GAME);
    await settle();
    http.expectOne(getCommentsUrl('palia', email)).flush(API_COMMENTS);
    await settle();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function query<T extends HTMLElement>(selector: string): T {
    return element().querySelector(selector) as T;
  }

  function textarea(): HTMLTextAreaElement {
    return query<HTMLTextAreaElement>('textarea');
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('opens with a skeleton while loading', async () => {
    await setup();

    expect(query<HTMLDialogElement>('dialog').open).toBe(true);
    expect(query('.game-details-dialog__hero--skeleton')).not.toBeNull();
  });

  it('shows the game, the records and the comments', async () => {
    await setup();
    await respondWithGame();

    expect(query('.game-details-dialog__title').textContent).toBe('Palia');
    expect(query('.game-details-dialog__stat-likes').textContent).toBe('1.5K');
    expect(query('.game-details-dialog__record-name').textContent).toBe('Ann');
    expect(query('.game-details-dialog__comments-title').textContent).toContain('Comments (7)');
  });

  it('shows a comment as plain text, so HTML in it cannot run', async () => {
    await setup();
    await respondWithGame();

    const comment = query('.game-details-dialog__comment-text');

    expect(comment.textContent).toBe('<b>Lovely</b>');
    expect(comment.querySelector('b')).toBeNull();
  });

  it('shows "not found" for a 404, without a snackbar', async () => {
    await setup();
    http.expectOne(getGameDetailsUrl('palia')).flush('', { status: 404, statusText: 'Not Found' });
    await settle();

    expect(query('.game-details-dialog__state--empty').textContent).toContain(
      'This game could not be found.'
    );
    expect(TestBed.inject(SnackbarService).messages()).toEqual([]);
  });

  it('shows an error with Retry for other failures', async () => {
    await setup();
    http.expectOne(getGameDetailsUrl('palia')).flush('', { status: 500, statusText: 'Error' });
    await settle();

    query('.game-details-dialog__state-retry').click();
    await settle();
    await respondWithGame();

    expect(query('.game-details-dialog__title').textContent).toBe('Palia');
  });

  it('removes the game from the URL when the user closes the dialog', async () => {
    await setup();
    await TestBed.inject(Router).navigateByUrl('/?game=palia');
    await respondWithGame();

    query('.game-details-dialog__close').click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('keeps the game in the URL when something else closed the dialog', async () => {
    await setup();
    await TestBed.inject(Router).navigateByUrl('/?game=palia&auth=login');

    fixture.componentRef.setInput('slug', undefined);
    await settle();

    expect(query<HTMLDialogElement>('dialog').open).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/?game=palia&auth=login');
  });

  it('locks the comment form for a guest', async () => {
    await setup();
    await respondWithGame();

    expect(textarea().disabled).toBe(true);
  });

  it('asks a guest to log in instead of saving a favorite', async () => {
    await setup();
    await respondWithGame();

    query('.game-details-dialog__favorite').click();
    await settle();

    http.expectNone(apiUrl('/games/palia/favorite'));
    expect(TestBed.inject(Router).url).toBe('/?auth=login');
    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toBe(
      'Log in to add games to your favorites.'
    );
  });

  it('saves a favorite for a logged-in user', async () => {
    storeSession();
    await setup();
    await respondWithGame('forest@test.dev');

    query('.game-details-dialog__favorite').click();
    await settle();

    const request = http.expectOne(apiUrl('/games/palia/favorite'));
    expect(request.request.body).toEqual({ userEmail: 'forest@test.dev' });
    request.flush({ data: { isFavorited: false, likesCount: 1499 } });
    await settle();

    const favorite = query('.game-details-dialog__favorite');
    expect(favorite.getAttribute('aria-pressed')).toBe('false');
    expect(favorite.getAttribute('aria-label')).toBe('Add to Favorites');
    expect(query('.game-details-dialog__stat-likes').textContent).toBe('1.5K');
  });

  it('posts a comment and reloads the list', async () => {
    storeSession();
    await setup();
    await respondWithGame('forest@test.dev');

    textarea().value = '  Great game  ';
    textarea().dispatchEvent(new Event('input'));
    await settle();
    query('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();

    const request = http.expectOne(apiUrl('/games/palia/comments'));
    expect(request.request.body).toEqual({
      userEmail: 'forest@test.dev',
      authorName: 'Forest Dweller',
      text: 'Great game',
    });
    request.flush({});
    await settle();

    expect(textarea().value).toBe('');
    http.expectOne(getCommentsUrl('palia', 'forest@test.dev')).flush(API_COMMENTS);
  });

  it('warns that a comment may have been sent after a network failure', async () => {
    storeSession();
    await setup();
    await respondWithGame('forest@test.dev');

    textarea().value = 'Great game';
    textarea().dispatchEvent(new Event('input'));
    await settle();
    query('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();

    http.expectOne(apiUrl('/games/palia/comments')).error(new ProgressEvent('error'));
    await settle();

    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toContain(
      "couldn't confirm your comment"
    );
    expect(textarea().value).toBe('Great game');
  });

  it('likes a comment', async () => {
    storeSession();
    await setup();
    await respondWithGame('forest@test.dev');

    query('.game-details-dialog__like').click();
    await settle();

    http
      .expectOne(apiUrl('/comments/c1/like'))
      .flush({ data: { isLikedByCurrentUser: true, likesCount: 3 } });
    await settle();

    expect(query('.game-details-dialog__like').getAttribute('aria-pressed')).toBe('true');
    expect(query('.game-details-dialog__like-count').textContent).toBe('3');
  });
});
