import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject } from '@angular/core';
import { SnackbarService } from '../../core/snackbar.service';
import {
  LEADERBOARD_URL,
  type LeaderboardResponse,
  parseLeaderboard,
  type Player,
} from './leaderboard.data';

const COMPACT_VISIBLE_ROWS: number = 3;

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.scss', './leaderboard.states.scss'],
})
export class Leaderboard {
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  protected readonly leaderboard = httpResource<LeaderboardResponse>((): string => LEADERBOARD_URL);

  protected readonly players = computed<Player[]>((): Player[] =>
    this.leaderboard.hasValue() ? parseLeaderboard(this.leaderboard.value()) : []
  );

  protected readonly compactVisibleRows: number = COMPACT_VISIBLE_ROWS;
  protected readonly skeletonRows: number[] = [1, 2, 3, 4, 5];

  constructor() {
    effect((): void => {
      if (this.leaderboard.error()) {
        this.snackbar.show('Could not load the leaderboard.', 'error');
      }
    });
  }
}
