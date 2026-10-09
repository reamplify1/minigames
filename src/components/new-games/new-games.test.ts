import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FeaturedGame } from './new-games.data';

const { fetchFeaturedGamesMock, navigateMock, showSnackbarMock } = vi.hoisted(() => ({
  fetchFeaturedGamesMock: vi.fn(),
  navigateMock: vi.fn(),
  showSnackbarMock: vi.fn(),
}));

vi.mock('./new-games.data', () => ({ fetchFeaturedGames: fetchFeaturedGamesMock }));
vi.mock('../../app/router', () => ({ navigate: navigateMock }));
vi.mock('../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

import { createNewGames } from './new-games';

// jsdom has no ResizeObserver, so we give the slider a do-nothing one.
class FakeResizeObserver {
  observe = vi.fn();
}

// jsdom has no real layout, so we pretend the track is 1000px wide and the
// CSS variables give a "tablet" layout: small cards of 100px, no medium cards
// and a 10px gap. That makes the center card 780px wide.
const CSS_SIZES: Record<string, string> = {
  '--slider-card-small': '100px',
  '--slider-card-medium': '0px',
  '--slider-gap': '10px',
};

const SLUGS = ['a', 'b', 'c', 'd', 'e'];

function buildGames(): FeaturedGame[] {
  return SLUGS.map((slug) => ({ slug, title: slug, rating: 4.5, likes: '10', image: '' }));
}

async function mountNewGames(): Promise<HTMLElement> {
  const section = createNewGames();
  document.body.replaceChildren(section);
  await vi.waitFor(() => expect(section.querySelectorAll('[data-slider-slide]')).toHaveLength(5));
  return section;
}

// Finds the slide by comparing data-game-slug directly, so the slug never has
// to be pasted into a CSS selector.
function getSlide(section: HTMLElement, slug: string): HTMLElement {
  const cards = [...section.querySelectorAll<HTMLElement>('[data-slider-card]')];
  const card = cards.find((item) => item.dataset.gameSlug === slug);
  return card?.closest('li') as HTMLElement;
}

function getCenterSlug(section: HTMLElement): string | undefined {
  const card = section.querySelector<HTMLElement>(
    ':scope .new-games__slide--info [data-slider-card]'
  );
  return card?.dataset.gameSlug;
}

function pointer(target: EventTarget, type: string, clientX: number): void {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, button: 0 }));
}

describe('createNewGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const fakeStyle = { getPropertyValue: (name: string) => CSS_SIZES[name] ?? '' };
    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
      fakeStyle as unknown as CSSStyleDeclaration
    );
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('loading states', () => {
    it('shows skeleton cards while the games are loading', () => {
      fetchFeaturedGamesMock.mockReturnValue(new Promise(() => {}));

      const section = createNewGames();

      expect(section.querySelectorAll('.new-games__skeleton-card')).toHaveLength(5);
    });

    it('shows the empty state when there are no featured games', async () => {
      fetchFeaturedGamesMock.mockResolvedValue([]);

      const section = createNewGames();

      await vi.waitFor(() => expect(section.querySelector('.new-games__empty')).not.toBeNull());
    });

    it('shows an error with Retry, and loads the games again on Retry', async () => {
      fetchFeaturedGamesMock.mockRejectedValueOnce(new Error('Network error'));
      fetchFeaturedGamesMock.mockResolvedValueOnce(buildGames());

      const section = createNewGames();

      await vi.waitFor(() => expect(section.querySelector('.new-games__error')).not.toBeNull());
      expect(showSnackbarMock).toHaveBeenCalledWith('Could not load featured games.', 'error');

      section.querySelector<HTMLButtonElement>(':scope .new-games__error button')?.click();

      await vi.waitFor(() =>
        expect(section.querySelectorAll('[data-slider-slide]')).toHaveLength(5)
      );
      expect(fetchFeaturedGamesMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('slider', () => {
    beforeEach(() => {
      fetchFeaturedGamesMock.mockResolvedValue(buildGames());
    });

    it('makes the first card the large center card and hides the far cards', async () => {
      const section = await mountNewGames();

      expect(getCenterSlug(section)).toBe('a');
      expect(getSlide(section, 'a').style.width).toBe('780px');
      expect(getSlide(section, 'b').style.width).toBe('100px');
      expect(getSlide(section, 'e').style.width).toBe('100px');
      expect(getSlide(section, 'c').classList.contains('new-games__slide--hidden')).toBe(true);
      expect(getSlide(section, 'c').hasAttribute('inert')).toBe(true);
    });

    it('moves forward with the next arrow and wraps around with the previous arrow', async () => {
      const section = await mountNewGames();

      section.querySelector<HTMLButtonElement>('[data-slider-next]')?.click();
      expect(getCenterSlug(section)).toBe('b');

      section.querySelector<HTMLButtonElement>('[data-slider-previous]')?.click();
      section.querySelector<HTMLButtonElement>('[data-slider-previous]')?.click();
      expect(getCenterSlug(section)).toBe('e');
    });

    it('opens game details when a card is clicked', async () => {
      const section = await mountNewGames();

      section.querySelector<HTMLButtonElement>('[data-game-slug="b"]')?.click();

      expect(navigateMock).toHaveBeenCalledWith('/?game=b');
    });

    it('moves on a swipe and ignores the click that ends the swipe', async () => {
      const section = await mountNewGames();
      const track = section.querySelector('[data-slider-track]') as HTMLElement;

      pointer(track, 'pointerdown', 300);
      pointer(document, 'pointerup', 200);

      expect(getCenterSlug(section)).toBe('b');

      section.querySelector<HTMLButtonElement>('[data-game-slug="b"]')?.click();
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('swipes back to the previous card when dragged to the right', async () => {
      const section = await mountNewGames();
      const track = section.querySelector('[data-slider-track]') as HTMLElement;

      pointer(track, 'pointerdown', 200);
      pointer(document, 'pointerup', 300);

      expect(getCenterSlug(section)).toBe('e');
    });

    it('does not move on a short drag', async () => {
      const section = await mountNewGames();
      const track = section.querySelector('[data-slider-track]') as HTMLElement;

      pointer(track, 'pointerdown', 200);
      pointer(document, 'pointerup', 210);

      expect(getCenterSlug(section)).toBe('a');
    });
  });

  describe('autoplay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      fetchFeaturedGamesMock.mockResolvedValue(buildGames());
    });

    it('moves to the next card every 4 seconds', async () => {
      const section = await mountNewGames();

      vi.advanceTimersByTime(4000);
      expect(getCenterSlug(section)).toBe('b');

      vi.advanceTimersByTime(4000);
      expect(getCenterSlug(section)).toBe('c');
    });

    it('pauses while the user holds a card and continues after a cancelled gesture', async () => {
      const section = await mountNewGames();
      const track = section.querySelector('[data-slider-track]') as HTMLElement;

      pointer(track, 'pointerdown', 200);
      vi.advanceTimersByTime(10_000);
      expect(getCenterSlug(section)).toBe('a');

      document.dispatchEvent(new Event('pointercancel'));
      vi.advanceTimersByTime(4000);
      expect(getCenterSlug(section)).toBe('b');
    });
  });
});
