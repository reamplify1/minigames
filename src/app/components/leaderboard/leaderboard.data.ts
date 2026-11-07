import { apiUrl } from '../../core/api';
import { formatCompactNumber } from '../../core/format';

export type AvatarColor = 'yellow' | 'green' | 'blue' | 'pink' | 'lavender';

export interface Player {
  initials: string;
  name: string;
  avatarColor: AvatarColor;
  gamesPlayed: number;
  score: string;
  compactScore: string;
  streakDays: number;
  favoriteGame: string;
}

interface ApiPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

export interface LeaderboardResponse {
  data: ApiPlayer[];
}

export const LEADERBOARD_URL: string = apiUrl('/leaderboard');

const AVATAR_COLORS: AvatarColor[] = ['yellow', 'green', 'blue', 'pink', 'lavender'];

function splitIntoWords(name: string): string[] {
  return name
    .split('_')
    .flatMap((part: string): string[] => part.match(/[A-Z][a-z0-9]*|[a-z0-9]+/g) ?? [part]);
}

function getInitials(name: string): string {
  return splitIntoWords(name)
    .slice(0, 2)
    .map((word: string): string => word.charAt(0).toUpperCase())
    .join('');
}

function mapPlayer(player: ApiPlayer): Player {
  return {
    initials: getInitials(player.playerName),
    name: player.playerName,
    avatarColor: AVATAR_COLORS[(player.rank - 1) % AVATAR_COLORS.length] ?? 'yellow',
    gamesPlayed: player.gamesPlayed,
    score: player.totalScore.toLocaleString('en-US'),
    compactScore: formatCompactNumber(player.totalScore),
    streakDays: player.streakDays,
    favoriteGame: player.favoriteGameName,
  };
}

export function parseLeaderboard(response: LeaderboardResponse): Player[] {
  return response.data.map((player: ApiPlayer): Player => mapPlayer(player));
}
