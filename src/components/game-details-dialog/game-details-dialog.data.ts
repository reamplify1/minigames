import { fetchJson, ApiError } from '../../utils/api';
import { IMAGE_BY_SLUG, FALLBACK_IMAGE } from '../game-cards-section/games.data';

export interface GameInfoItem {
  label: string;
  value: string;
}

export interface GameRecord {
  player: string;
  score: string;
  date: string;
}

export interface GameDetails {
  title: string;
  heroImage: string;
  rating: string;
  likes: string;
  description: string;
  info: GameInfoItem[];
  records: GameRecord[];
}

interface ApiGameSpecs {
  genre: string;
  players: string;
  duration: string;
  price: string;
}

interface ApiGameRecord {
  position: number;
  playerName: string;
  score: number;
  achievedAt: string;
}

interface ApiGameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: ApiGameSpecs;
  topRecords: ApiGameRecord[];
}

interface GameDetailsResponse {
  data: ApiGameDetails;
}

function formatLikes(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function formatScore(score: number): string {
  return `${score.toLocaleString('en-US')} pts`;
}

const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;

function formatRelativeTime(isoDate: string): string {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();

  if (elapsedMs < MINUTE_IN_MS) return 'just now';
  if (elapsedMs < HOUR_IN_MS) return `${Math.floor(elapsedMs / MINUTE_IN_MS)} min ago`;
  if (elapsedMs < DAY_IN_MS) return `${Math.floor(elapsedMs / HOUR_IN_MS)} hours ago`;

  return elapsedMs < WEEK_IN_MS
    ? `${Math.floor(elapsedMs / DAY_IN_MS)} days ago`
    : `${Math.floor(elapsedMs / WEEK_IN_MS)} weeks ago`;
}

function mapRecord(record: ApiGameRecord): GameRecord {
  return {
    player: record.playerName,
    score: formatScore(record.score),
    date: formatRelativeTime(record.achievedAt),
  };
}

function mapGame(game: ApiGameDetails): GameDetails {
  return {
    title: game.name,
    heroImage: IMAGE_BY_SLUG[game.slug] ?? FALLBACK_IMAGE,
    rating: String(game.rating),
    likes: formatLikes(game.likesCount),
    description: game.fullDescription,
    info: [
      { label: 'Genre', value: game.specs.genre },
      { label: 'Players', value: game.specs.players },
      { label: 'Duration', value: game.specs.duration },
      { label: 'Price', value: game.specs.price },
    ],
    records: game.topRecords.map((record) => mapRecord(record)),
  };
}

// Returns undefined when the game slug does not exist (a 404 from the API),
// so the dialog can show its empty state instead of the error banner.
export async function fetchGameDetails(slug: string): Promise<GameDetails | undefined> {
  try {
    const response = await fetchJson<GameDetailsResponse>(`/games/${slug}`);
    return mapGame(response.data);
  } catch (error) {
    if (error instanceof ApiError && error.message.includes('404')) {
      return undefined;
    }

    throw error;
  }
}
