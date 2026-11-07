import { apiUrl } from '../../core/api';
import { formatCompactNumber } from '../../core/format';
import { getGameImage } from '../../core/game-images';

const GAMES_PER_PAGE: string = '6';

export interface Game {
  id: string;
  title: string;
  genre: string;
  price: string;
  description: string;
  rating: number;
  likes: string;
  cover: string;
}

export interface GameFilters {
  category: string;
  sort: string;
  page: number;
}

export interface GamesMeta {
  page: number;
  totalPages: number;
}

interface ApiGame {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
}

export interface GamesResponse {
  data: ApiGame[];
  meta: GamesMeta;
}

function mapGame(game: ApiGame): Game {
  return {
    id: game.slug,
    title: game.name,
    genre: game.category.charAt(0).toUpperCase() + game.category.slice(1),
    price: game.price,
    description: game.shortDescription,
    rating: game.rating,
    likes: formatCompactNumber(game.likesCount),
    cover: getGameImage(game.slug),
  };
}

export function parseGames(response: GamesResponse): Game[] {
  return response.data.map((game: ApiGame): Game => mapGame(game));
}

export function getGamesUrl(filters: GameFilters): string {
  const query = new URLSearchParams({
    category: filters.category,
    sort: filters.sort,
    page: String(filters.page),
    limit: GAMES_PER_PAGE,
  });

  return apiUrl(`/games?${query.toString()}`);
}
