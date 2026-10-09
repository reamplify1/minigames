import { describe, it, expect } from 'vitest';
import { createGameRecords } from './game-records';

function buildRecord(player: string) {
  return { player, score: '100 pts', date: 'just now' };
}

describe('createGameRecords', () => {
  it('renders one list item per record', () => {
    const section = createGameRecords([buildRecord('Ann'), buildRecord('Bob')]);

    expect(section.querySelectorAll('.game-details-dialog__record')).toHaveLength(2);
  });

  it('gives medals to the top three places only', () => {
    const section = createGameRecords([
      buildRecord('Ann'),
      buildRecord('Bob'),
      buildRecord('Cid'),
      buildRecord('Dan'),
    ]);

    const medals = [...section.querySelectorAll('.game-details-dialog__record-medal')].map(
      (medal) => medal.textContent
    );

    expect(medals).toEqual(['🥇', '🥈', '🥉', '']);
  });

  it('shows the player name, score and date of each record', () => {
    const section = createGameRecords([buildRecord('Ann')]);

    expect(section.querySelector('.game-details-dialog__record-name')?.textContent).toBe('Ann');
    expect(section.querySelector('.game-details-dialog__record-score')?.textContent).toBe(
      '100 pts'
    );
    expect(section.querySelector('.game-details-dialog__record-date')?.textContent).toBe(
      'just now'
    );
  });
});
