import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { DialogNavigationService } from '../../core/dialog-navigation.service';
import { SnackbarService } from '../../core/snackbar.service';
import {
  type Game,
  type GameFilters,
  type GamesMeta,
  type GamesResponse,
  getGamesUrl,
  parseGames,
} from './games.data';

const FREE_PRICE: string = 'Free';

@Component({
  selector: 'app-game-cards-section',
  templateUrl: './game-cards-section.html',
  styleUrls: ['./game-cards-section.scss', './game-cards-section.states.scss'],
})
export class GameCardsSection {
  readonly filters = input.required<GameFilters>();
  readonly metaChange = output<GamesMeta>();

  protected readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  protected readonly games = httpResource<GamesResponse>((): string => getGamesUrl(this.filters()));

  protected readonly gameCards = computed<Game[]>((): Game[] =>
    this.games.hasValue() ? parseGames(this.games.value()) : []
  );

  protected readonly freePrice: string = FREE_PRICE;
  protected readonly skeletonCards: number[] = [1, 2, 3, 4, 5, 6];

  constructor() {
    effect((): void => {
      if (this.games.hasValue()) {
        this.metaChange.emit(this.games.value().meta);
      }
    });

    effect((): void => {
      if (this.games.error()) {
        this.snackbar.show('Could not load games.', 'error');
      }
    });
  }
}
