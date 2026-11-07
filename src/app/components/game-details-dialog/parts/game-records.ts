import { Component, input } from '@angular/core';
import type { GameRecord } from '../game-details-dialog.data';

@Component({
  selector: 'app-game-records',
  template: `
    <section class="game-details-dialog__records" aria-labelledby="game-details-records-title">
      <h3 class="game-details-dialog__records-title" id="game-details-records-title">
        <span class="game-details-dialog__records-icon" aria-hidden="true">🏆</span>
        Top Records
      </h3>
      <ol class="game-details-dialog__records-list">
        @for (record of records(); track $index) {
          <li class="game-details-dialog__record">
            <span class="game-details-dialog__record-player">
              <span class="game-details-dialog__record-medal" aria-hidden="true">
                {{ medals[$index] }}
              </span>
              <span class="game-details-dialog__record-name">{{ record.player }}</span>
            </span>
            <span class="game-details-dialog__record-result">
              <span class="game-details-dialog__record-score">{{ record.score }}</span>
              <span class="game-details-dialog__record-date">{{ record.date }}</span>
            </span>
          </li>
        }
      </ol>
    </section>
  `,
})
export class GameRecords {
  readonly records = input.required<GameRecord[]>();

  protected readonly medals: string[] = ['🥇', '🥈', '🥉'];
}
