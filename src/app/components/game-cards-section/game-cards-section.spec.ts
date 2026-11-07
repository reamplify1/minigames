import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { GameCardsSection } from './game-cards-section';
import { type GameFilters, type GamesResponse, getGamesUrl, parseGames } from './games.data';

const FILTERS: GameFilters = { category: 'all', sort: 'rating-desc', page: 2 };

const API_RESPONSE: GamesResponse = {
  data: [
    {
      slug: 'palia',
      name: 'Palia',
      category: 'strategy',
      price: 'Free',
      shortDescription: 'Cozy life',
      rating: 4.8,
      likesCount: 2000,
    },
  ],
  meta: { page: 2, totalPages: 4 },
};

describe('games data', () => {
  it('builds the URL from the filters', () => {
    expect(getGamesUrl(FILTERS)).toContain('/games?category=all&sort=rating-desc&page=2&limit=6');
  });

  it('maps a game for the cards', () => {
    expect(parseGames(API_RESPONSE)[0]).toMatchObject({
      id: 'palia',
      genre: 'Strategy',
      likes: '2.0K',
    });
  });
});

describe('GameCardsSection', () => {
  let fixture: ComponentFixture<GameCardsSection>;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GameCardsSection);
    fixture.componentRef.setInput('filters', FILTERS);
    await settle();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the cards and reports the page numbers', async () => {
    const onMeta = vi.fn();
    fixture.componentInstance.metaChange.subscribe(onMeta);

    http.expectOne(getGamesUrl(FILTERS)).flush(API_RESPONSE);
    await settle();

    expect(element().querySelector('.library-card__title')?.textContent).toBe('Palia');
    expect(element().querySelector('.library-card__price--free')).not.toBeNull();
    expect(onMeta).toHaveBeenCalledWith({ page: 2, totalPages: 4 });
  });

  it('cancels the old request when the filters change', async () => {
    const oldRequest = http.expectOne(getGamesUrl(FILTERS));
    const newFilters = { ...FILTERS, page: 3 };

    fixture.componentRef.setInput('filters', newFilters);
    await settle();

    expect(oldRequest.cancelled).toBe(true);
    http.expectOne(getGamesUrl(newFilters)).flush(API_RESPONSE);
    await settle();
    expect(element().querySelectorAll('.library-card')).toHaveLength(1);
  });

  it('opens the game from the Details button', async () => {
    http.expectOne(getGamesUrl(FILTERS)).flush(API_RESPONSE);
    await settle();

    element().querySelector<HTMLElement>('.library-card__details')?.click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/?game=palia');
  });

  it('shows the error state', async () => {
    http.expectOne(getGamesUrl(FILTERS)).flush('', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(element().querySelector('.library-games__error')).not.toBeNull();
  });
});
