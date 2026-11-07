import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  type EffectCleanupRegisterFn,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DialogNavigationService } from '../../core/dialog-navigation.service';
import { SnackbarService } from '../../core/snackbar.service';
import { AutoplayTimer } from './autoplay-timer';
import {
  FEATURED_GAMES_URL,
  type FeaturedGame,
  type FeaturedGamesResponse,
  parseFeaturedGames,
} from './new-games.data';
import { type CardSizes, getSlideLayouts, type SlideLayout } from './slider-layout';

const AUTOPLAY_DELAY: number = 4000;
const SWIPE_THRESHOLD: number = 40;

interface Slide {
  game: FeaturedGame;
  layout: SlideLayout;
}

function readPixels(element: HTMLElement, propertyName: string): number {
  const value = getComputedStyle(element).getPropertyValue(propertyName);
  return Number(value.trim().replace('px', '')) || 0;
}

@Component({
  selector: 'app-new-games',
  templateUrl: './new-games.html',
  styleUrls: ['./new-games.scss', './new-games.states.scss'],
  host: {
    '(document:pointerup)': 'onPointerUp($event)',
    '(document:pointercancel)': 'onPointerCancel()',
  },
})
export class NewGames {
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  protected readonly games = httpResource<FeaturedGamesResponse>((): string => FEATURED_GAMES_URL);

  protected readonly featuredGames = computed<FeaturedGame[]>((): FeaturedGame[] =>
    this.games.hasValue() ? parseFeaturedGames(this.games.value()) : []
  );

  protected readonly skeletonCards: number[] = [1, 2, 3, 4, 5];

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  private readonly centerIndex = signal<number>(0);
  private readonly trackWidth = signal<number>(0);
  private readonly cardSizes = signal<CardSizes>({
    small: 0,
    medium: 0,
    gap: 0,
  });

  protected readonly slides = computed<Slide[]>((): Slide[] => {
    const games = this.featuredGames();
    const layouts = getSlideLayouts(
      games.length,
      this.centerIndex(),
      this.trackWidth(),
      this.cardSizes()
    );

    return games.map((game: FeaturedGame, index: number): Slide => ({
      game,
      layout: layouts[index],
    }));
  });

  private readonly autoplay: AutoplayTimer = new AutoplayTimer(AUTOPLAY_DELAY, (): void => {
    this.move(1);
    this.autoplay.restart();
  });

  private pointerStartX: number | undefined;
  private shouldIgnoreClick: boolean = false;

  constructor() {
    effect((onCleanup: EffectCleanupRegisterFn): void => {
      const track = this.track()?.nativeElement;

      if (!track) {
        return;
      }

      const observer = new ResizeObserver((): void => {
        this.measure(track);
      });

      observer.observe(track);
      this.measure(track);
      this.autoplay.restart();

      onCleanup((): void => {
        observer.disconnect();
        this.autoplay.stop();
      });
    });

    effect((): void => {
      if (this.games.error()) {
        this.snackbar.show('Could not load featured games.', 'error');
      }
    });
  }

  protected onArrowClick(step: number): void {
    if (this.track()) {
      this.move(step);
      this.autoplay.restart();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.pointerStartX = event.clientX;
    this.shouldIgnoreClick = false;
    this.autoplay.pause();
  }

  protected onPointerUp(event: PointerEvent): void {
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

  protected onPointerCancel(): void {
    if (this.pointerStartX !== undefined) {
      this.pointerStartX = undefined;
      this.autoplay.resume();
    }
  }

  protected onCardClick(slug: string): void {
    if (this.shouldIgnoreClick) {
      this.shouldIgnoreClick = false;
      return;
    }

    this.dialogs.openGame(slug);
  }

  private move(step: number): void {
    const total = this.featuredGames().length;
    this.centerIndex.update((index: number): number => (index + step + total) % total);
  }

  private measure(track: HTMLElement): void {
    this.trackWidth.set(track.clientWidth);
    this.cardSizes.set({
      small: readPixels(track, '--slider-card-small'),
      medium: readPixels(track, '--slider-card-medium'),
      gap: readPixels(track, '--slider-gap'),
    });
  }
}
