import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { NewGames } from './new-games';
import {
  FEATURED_GAMES_URL,
  type FeaturedGamesResponse,
  parseFeaturedGames,
} from './new-games.data';

const API_GAMES: FeaturedGamesResponse = {
  data: [
    { slug: 'palia', name: 'Palia', rating: 4.8, likesCount: 89_500 },
    { slug: 'tiny-glade', name: 'Tiny Glade', rating: 4.9, likesCount: 600 },
    { slug: 'unknown', name: 'Unknown', rating: 4, likesCount: 1 },
  ],
};

describe('parseFeaturedGames', () => {
  it('maps API fields and finds the local image', () => {
    expect(parseFeaturedGames(API_GAMES)[0]).toEqual({
      slug: 'palia',
      title: 'Palia',
      rating: 4.8,
      likes: '89.5K',
      image: 'assets/images/games/palia-card.png',
    });
  });

  it('uses the fallback image for an unknown game', () => {
    expect(parseFeaturedGames(API_GAMES)[2]?.image).toContain('vacation-cafe-simulator');
  });
});

describe('NewGames', () => {
  let fixture: ComponentFixture<NewGames>;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NewGames);
    await settle();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function respondWithGames(): Promise<void> {
    http.expectOne(FEATURED_GAMES_URL).flush(API_GAMES);
    await settle();
  }

  function firstCardTransform(): string {
    return element().querySelector<HTMLElement>('.new-games__slide')?.style.transform ?? '';
  }

  it('shows skeleton cards while loading', () => {
    expect(element().querySelectorAll('.new-games__skeleton-card')).toHaveLength(5);
  });

  it('shows a slide for every game', async () => {
    await respondWithGames();
    expect(element().querySelectorAll('.new-games__slide')).toHaveLength(3);
  });

  it('shows the empty state', async () => {
    http.expectOne(FEATURED_GAMES_URL).flush({ data: [] });
    await settle();
    expect(element().querySelector('.new-games__empty')).not.toBeNull();
  });

  it('shows an error, then loads again after Retry', async () => {
    http.expectOne(FEATURED_GAMES_URL).flush('', { status: 500, statusText: 'Server Error' });
    await settle();

    element().querySelector<HTMLElement>('.new-games__error button')?.click();
    await settle();
    await respondWithGames();

    expect(element().querySelector('.new-games__error')).toBeNull();
    expect(element().querySelectorAll('.new-games__slide')).toHaveLength(3);
  });

  it('moves the cards with the arrow buttons', async () => {
    await respondWithGames();
    const before = firstCardTransform();

    element().querySelector<HTMLElement>('.new-games__arrow--accent')?.click();
    await settle();

    expect(firstCardTransform()).not.toBe(before);
  });

  it('moves on a swipe and does not open the game afterwards', async () => {
    await respondWithGames();
    const before = firstCardTransform();
    const track = element().querySelector<HTMLElement>('.new-games__track');
    const card = element().querySelector<HTMLElement>('.new-games__card');

    track?.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, bubbles: true }));
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, bubbles: true }));
    card?.click();
    await settle();

    expect(firstCardTransform()).not.toBe(before);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('opens the game on a plain click', async () => {
    await respondWithGames();

    element().querySelector<HTMLElement>('.new-games__card')?.click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/?game=palia');
  });

  it('stops the observer when the component is destroyed', async () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    await respondWithGames();

    fixture.destroy();

    expect(disconnect).toHaveBeenCalled();
  });
});
