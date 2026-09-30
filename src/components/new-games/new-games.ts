import './new-games.scss';
import arrowLeftIcon from '../../assets/icons/arrow-left-icon.svg';
import arrowRightIcon from '../../assets/icons/arrow-right-icon.svg';
import starIcon from '../../assets/icons/star-icon.svg';
import heartIcon from '../../assets/icons/favorite-icon.svg';
import { openGameDetailsDialog } from '../game-details-dialog/game-details-dialog';
import { fetchFeaturedGames, type FeaturedGame } from './new-games.data';
import { createSkeleton, createErrorBanner, createEmptyState } from './new-games.states';
import { showSnackbar } from '../snackbar/snackbar';

const AUTOPLAY_DELAY = 4000;
const SWIPE_THRESHOLD = 40;
const INFO_MIN_WIDTH = 288;
const SKELETON_COUNT = 5;

const TITLE_ID = 'new-games-title';

const TRACK_SELECTOR = '[data-slider-track]';
const SLIDE_SELECTOR = '[data-slider-slide]';
const CARD_SELECTOR = '[data-slider-card]';
const PREVIOUS_SELECTOR = '[data-slider-previous]';
const NEXT_SELECTOR = '[data-slider-next]';

const SLIDE_HIDDEN_CLASS = 'new-games__slide--hidden';
const SLIDE_INFO_CLASS = 'new-games__slide--info';

interface CardSizes {
  small: number;
  medium: number;
  gap: number;
}

// ---------- Markup ----------

function createSlide(game: FeaturedGame, index: number, total: number): string {
  return `
    <li
      class="new-games__slide"
      aria-roledescription="slide"
      aria-label="${index + 1} of ${total}"
      data-slider-slide
    >
      <button
        class="new-games__card"
        type="button"
        aria-label="${game.title}, rating ${game.rating}, ${game.likes} likes. Open details"
        data-slider-card
        data-game-slug="${game.slug}"
      >
        <img class="new-games__card-image" src="${game.image}" alt="" draggable="false" />
        <span class="new-games__card-overlay" aria-hidden="true">
          <span class="new-games__card-title">${game.title}</span>
          <span class="new-games__card-stats">
            <span class="new-games__card-stat">
              <img class="new-games__card-stat-icon" src="${starIcon}" alt="" />
              ${game.rating}
            </span>
            <span class="new-games__card-stat">
              <img class="new-games__card-stat-icon" src="${heartIcon}" alt="" />
              ${game.likes}
            </span>
          </span>
        </span>
      </button>
    </li>
  `;
}

function createHeaderMarkup(): string {
  return `
    <div class="new-games__header">
      <div class="new-games__heading">
        <span class="new-games__marker" aria-hidden="true"></span>
        <h2 class="new-games__title" id="${TITLE_ID}">New Games</h2>
      </div>
      <div class="new-games__controls">
        <button
          class="new-games__arrow"
          type="button"
          aria-label="Previous games"
          data-slider-previous
        >
          <img class="new-games__arrow-icon" src="${arrowLeftIcon}" alt="" />
        </button>
        <button
          class="new-games__arrow new-games__arrow--accent"
          type="button"
          aria-label="Next games"
          data-slider-next
        >
          <img class="new-games__arrow-icon" src="${arrowRightIcon}" alt="" />
        </button>
      </div>
    </div>
  `;
}

function createSectionMarkup(games: FeaturedGame[]): string {
  return `
    ${createHeaderMarkup()}
    <ul class="new-games__track" role="list" data-slider-track>
      ${games.map((game, index) => createSlide(game, index, games.length)).join('')}
    </ul>
  `;
}

// ---------- Layout helpers ----------

// Reads a CSS variable like "120px" and returns 120.
function readPixels(element: HTMLElement, propertyName: string): number {
  const value = getComputedStyle(element).getPropertyValue(propertyName);
  return Number(value.trim().replace('px', '')) || 0;
}

function readCardSizes(track: HTMLElement): CardSizes {
  return {
    small: readPixels(track, '--slider-card-small'),
    medium: readPixels(track, '--slider-card-medium'),
    gap: readPixels(track, '--slider-gap'),
  };
}

// Widths of all places in the row, from left to right.
// Desktop: [hidden, small, medium, LARGE, medium, small, hidden]
// Tablet and mobile: [hidden, small, LARGE, small, hidden]
function getPlaceWidths(trackWidth: number, sizes: CardSizes): number[] {
  const { small, medium, gap } = sizes;
  const hasMedium = medium > 0;

  const leftCards = hasMedium ? [small, medium] : [small];
  const rightCards = hasMedium ? [medium, small] : [small];

  const oneSideWidth = small + medium + gap * leftCards.length;
  const largeWidth = Math.max(trackWidth - oneSideWidth * 2, 0);

  return [0, ...leftCards, largeWidth, ...rightCards, 0];
}

// Left coordinate of every place. Places go one after another with a gap.
function getPlacePositions(widths: number[], gap: number): number[] {
  const positions: number[] = [];
  let x = -gap;

  for (const width of widths) {
    positions.push(x);
    x += width + gap;
  }

  return positions;
}

// How far a card is from the center card: 0 = center, -1 = left neighbour, 1 = right neighbour.
// The slider is circular, so the distance always goes the short way around.
function getDistanceFromCenter(cardIndex: number, centerIndex: number, total: number): number {
  let distance = cardIndex - centerIndex;

  if (distance > total / 2) {
    distance -= total;
  }

  if (distance < -total / 2) {
    distance += total;
  }

  return distance;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ---------- Autoplay ----------

class AutoplayTimer {
  private readonly onTick: () => void;
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private startedAt = 0;
  private timeLeft = AUTOPLAY_DELAY;

  constructor(onTick: () => void) {
    this.onTick = onTick;
  }

  private startTimer(delay: number): void {
    clearTimeout(this.timerId);
    this.timeLeft = delay;
    this.startedAt = performance.now();
    this.timerId = setTimeout(() => {
      this.timerId = undefined;
      this.onTick();
    }, delay);
  }

  // Starts a fresh 4-second countdown.
  restart(): void {
    this.startTimer(AUTOPLAY_DELAY);
  }

  // Stops the countdown and remembers how much time was left.
  pause(): void {
    if (this.timerId === undefined) {
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.timeLeft = Math.max(this.timeLeft - (performance.now() - this.startedAt), 0);
  }

  // Continues the countdown from the remembered time.
  resume(): void {
    if (this.timerId === undefined) {
      this.startTimer(this.timeLeft);
    }
  }
}

// ---------- Slider ----------

class NewGamesSlider {
  private readonly section: HTMLElement;
  private readonly track: HTMLElement;
  private readonly slides: HTMLElement[];
  private readonly autoplay: AutoplayTimer;
  private centerIndex = 0;
  private pointerStartX: number | undefined;
  private shouldIgnoreClick = false;

  constructor(section: HTMLElement, track: HTMLElement) {
    this.section = section;
    this.track = track;
    this.slides = [...track.querySelectorAll<HTMLElement>(SLIDE_SELECTOR)];
    this.autoplay = new AutoplayTimer(() => {
      this.move(1);
      this.autoplay.restart();
    });
  }

  // Moves the slider by `step` cards: 1 = next, -1 = previous. Wraps around after the last card.
  private move(step: number): void {
    const total = this.slides.length;
    this.centerIndex = (this.centerIndex + step + total) % total;
    this.render();
  }

  // Gives every card its width and position. CSS transitions animate the change.
  private render(): void {
    const sizes = readCardSizes(this.track);
    const widths = getPlaceWidths(this.track.clientWidth, sizes);
    const positions = getPlacePositions(widths, sizes.gap);
    const centerPlace = Math.floor(widths.length / 2);
    const lastPlace = widths.length - 1;

    for (const [cardIndex, slide] of this.slides.entries()) {
      const distance = getDistanceFromCenter(cardIndex, this.centerIndex, this.slides.length);
      const place = clamp(centerPlace + distance, 0, lastPlace);
      const width = widths[place] ?? 0;
      const x = positions[place] ?? 0;
      const isHidden = width === 0;

      slide.style.width = `${width}px`;
      slide.style.transform = `translateX(${x}px)`;
      slide.classList.toggle(SLIDE_HIDDEN_CLASS, isHidden);
      slide.classList.toggle(SLIDE_INFO_CLASS, width >= INFO_MIN_WIDTH);
      slide.toggleAttribute('inert', isHidden);
    }
  }

  private handleArrowClick(step: number): void {
    this.move(step);
    this.autoplay.restart();
  }

  // Press and hold: pause autoplay.
  private handlePointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.pointerStartX = event.clientX;
    this.shouldIgnoreClick = false;
    this.autoplay.pause();
  }

  // Release: swipe → move and restart the timer; no swipe → continue the timer.
  private handlePointerUp(event: PointerEvent): void {
    if (this.pointerStartX === undefined) {
      return;
    }

    const deltaX = event.clientX - this.pointerStartX;
    this.pointerStartX = undefined;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      this.move(deltaX < 0 ? 1 : -1);
      this.shouldIgnoreClick = true;
      this.autoplay.restart();
      return;
    }

    this.autoplay.resume();
  }

  // The browser took over the gesture (for example, vertical page scroll).
  private handlePointerCancel(): void {
    if (this.pointerStartX === undefined) {
      return;
    }

    this.pointerStartX = undefined;
    this.autoplay.resume();
  }

  private handleClick(event: MouseEvent): void {
    if (this.shouldIgnoreClick) {
      this.shouldIgnoreClick = false;
      return;
    }

    const card =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(CARD_SELECTOR)
        : undefined;
    const slug = card?.dataset.gameSlug;

    if (slug) {
      openGameDetailsDialog(slug);
    }
  }

  start(): void {
    new ResizeObserver(() => {
      this.render();
    }).observe(this.track);

    this.track.addEventListener('pointerdown', (event) => {
      this.handlePointerDown(event);
    });
    document.addEventListener('pointerup', (event) => {
      this.handlePointerUp(event);
    });
    document.addEventListener('pointercancel', () => {
      this.handlePointerCancel();
    });
    this.track.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    this.section.querySelector(PREVIOUS_SELECTOR)?.addEventListener('click', () => {
      this.handleArrowClick(-1);
    });
    this.section.querySelector(NEXT_SELECTOR)?.addEventListener('click', () => {
      this.handleArrowClick(1);
    });

    this.render();
    this.autoplay.restart();
  }
}

// ---------- Section ----------

export function createNewGames(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games';
  section.setAttribute('aria-labelledby', TITLE_ID);
  section.setAttribute('aria-roledescription', 'carousel');

  const load = async (): Promise<void> => {
    section.innerHTML = `
      ${createHeaderMarkup()}
      <ul class="new-games__track">${createSkeleton(SKELETON_COUNT)}</ul>
    `;

    try {
      const games = await fetchFeaturedGames();

      if (games.length === 0) {
        section.querySelector('.new-games__track')?.replaceWith(createEmptyState());
        return;
      }

      section.innerHTML = createSectionMarkup(games);
      const track = section.querySelector<HTMLElement>(TRACK_SELECTOR);
      if (track) {
        new NewGamesSlider(section, track).start();
      }
    } catch {
      section.querySelector('.new-games__track')?.replaceWith(createErrorBanner(load));
      showSnackbar('Could not load featured games.', 'error');
    }
  };

  void load();
  return section;
}
