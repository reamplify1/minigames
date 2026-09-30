import { fetchJson } from '../../utils/api';
import type { AvatarColor, Player } from './leaderboard.types';

interface ApiPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

interface LeaderboardResponse {
  data: ApiPlayer[];
}

const AVATAR_COLORS: AvatarColor[] = ['yellow', 'green', 'blue', 'pink', 'lavender'];

function splitIntoWords(name: string): string[] {
  return name.split('_').flatMap((part) => part.match(/[A-Z][a-z0-9]*|[a-z0-9]+/g) ?? [part]);
}

function getInitials(name: string): string {
  return splitIntoWords(name)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

function formatCompactScore(score: number): string {
  return score >= 1000 ? `${(score / 1000).toFixed(1)}K` : String(score);
}

function mapPlayer(player: ApiPlayer): Player {
  return {
    initials: getInitials(player.playerName),
    name: player.playerName,
    compactName: player.playerName,
    avatarColor: AVATAR_COLORS[(player.rank - 1) % AVATAR_COLORS.length] ?? 'yellow',
    gamesPlayed: player.gamesPlayed,
    score: formatScore(player.totalScore),
    compactScore: formatCompactScore(player.totalScore),
    streakDays: player.streakDays,
    favoriteGame: player.favoriteGameName,
  };
}

export async function fetchLeaderboard(): Promise<Player[]> {
  const response = await fetchJson<LeaderboardResponse>('/leaderboard');
  return response.data.map((player) => mapPlayer(player));
}
