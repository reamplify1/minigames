import './leaderboard.scss';
import { fetchLeaderboard } from './leaderboard-data';
import type { Player } from './leaderboard.types';
import { createSkeletonRows, createErrorBanner, createEmptyState } from './leaderboard.states';
import { showSnackbar } from '../snackbar/snackbar';

const COMPACT_VISIBLE_ROWS = 3;
const SKELETON_ROW_COUNT = 5;

const headerRow = `
  <tr>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--rank" scope="col">Rank</th>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--player" scope="col">Player</th>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--games" scope="col">Games<span class="leaderboard__text-full"> Played</span></th>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--score" scope="col"><span class="leaderboard__text-full">Total </span>Score</th>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--streak" scope="col">Streak</th>
    <th class="leaderboard__cell leaderboard__cell--head leaderboard__cell--favorite" scope="col">Favorite Game</th>
  </tr>
`;

function createResponsiveText(full: string, compact: string): string {
  return `<span class="leaderboard__text-full">${full}</span><span class="leaderboard__text-compact">${compact}</span>`;
}

function createRow(player: Player, index: number): string {
  const rank = index + 1;
  const rowModifier = rank > COMPACT_VISIBLE_ROWS ? ' leaderboard__row--extra' : '';
  const rankModifier = rank === 1 ? ' leaderboard__cell--first-place' : '';

  return `
    <tr class="leaderboard__row${rowModifier}">
      <td class="leaderboard__cell leaderboard__cell--rank${rankModifier}">#${rank}</td>
      <td class="leaderboard__cell leaderboard__cell--player">
        <div class="leaderboard__player">
          <span class="leaderboard__avatar leaderboard__avatar--${player.avatarColor}" aria-hidden="true">${player.initials}</span>
          <span class="leaderboard__name">${createResponsiveText(player.name, player.compactName)}</span>
        </div>
      </td>
      <td class="leaderboard__cell leaderboard__cell--games">${player.gamesPlayed}</td>
      <td class="leaderboard__cell leaderboard__cell--score">${createResponsiveText(player.score, player.compactScore)}</td>
      <td class="leaderboard__cell leaderboard__cell--streak">
        <span class="leaderboard__streak">
          <span class="leaderboard__streak-icon" aria-hidden="true">🔥</span>
          ${createResponsiveText(`${player.streakDays} days`, `${player.streakDays}d`)}
        </span>
      </td>
      <td class="leaderboard__cell leaderboard__cell--favorite">
        <span class="leaderboard__pill">${player.favoriteGame}</span>
      </td>
    </tr>
  `;
}

function createHeaderMarkup(): string {
  return `
    <div class="leaderboard__header">
      <span class="leaderboard__marker" aria-hidden="true"></span>
      <h2 class="leaderboard__title" id="leaderboard-title">Top Players<span class="leaderboard__text-full"> This Week</span></h2>
    </div>
  `;
}

export function createLeaderboard(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'leaderboard';
  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const load = async (): Promise<void> => {
    section.innerHTML = `
      ${createHeaderMarkup()}
      <div class="leaderboard__table-wrap">
        <table class="leaderboard__table" aria-labelledby="leaderboard-title">
          <thead>${headerRow}</thead>
          <tbody>${createSkeletonRows(SKELETON_ROW_COUNT)}</tbody>
        </table>
      </div>
    `;

    try {
      const players = await fetchLeaderboard();

      if (players.length === 0) {
        section.querySelector('.leaderboard__table-wrap')?.replaceWith(createEmptyState());
        return;
      }

      section.innerHTML = `
        ${createHeaderMarkup()}
        <div class="leaderboard__table-wrap">
          <table class="leaderboard__table" aria-labelledby="leaderboard-title">
            <thead>${headerRow}</thead>
            <tbody>${players.map((player, index) => createRow(player, index)).join('')}</tbody>
          </table>
        </div>
      `;
    } catch {
      section.querySelector('.leaderboard__table-wrap')?.replaceWith(createErrorBanner(load));
      showSnackbar('Could not load the leaderboard.', 'error');
    }
  };

  void load();
  return section;
}
