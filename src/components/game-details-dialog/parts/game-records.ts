import type { GameRecord } from '../game-details-dialog.data';

const RECORDS_TITLE_ID = 'game-details-records-title';
const RECORD_MEDALS = ['🥇', '🥈', '🥉'] as const;

function createRecordItem({ player, score, date }: GameRecord, index: number): string {
  const medal = RECORD_MEDALS[index] ?? '';

  return `
    <li class="game-details-dialog__record">
      <span class="game-details-dialog__record-player">
        <span class="game-details-dialog__record-medal" aria-hidden="true">${medal}</span>
        <span class="game-details-dialog__record-name">${player}</span>
      </span>
      <span class="game-details-dialog__record-result">
        <span class="game-details-dialog__record-score">${score}</span>
        <span class="game-details-dialog__record-date">${date}</span>
      </span>
    </li>
  `;
}

export function createGameRecords(records: GameRecord[]): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-details-dialog__records';
  section.setAttribute('aria-labelledby', RECORDS_TITLE_ID);
  section.innerHTML = `
    <h3 class="game-details-dialog__records-title" id="${RECORDS_TITLE_ID}">
      <span class="game-details-dialog__records-icon" aria-hidden="true">🏆</span>
      Top Records
    </h3>
    <ol class="game-details-dialog__records-list">
      ${records.map((record, index) => createRecordItem(record, index)).join('')}
    </ol>
  `;

  return section;
}
