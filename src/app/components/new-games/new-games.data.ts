import { apiUrl } from '../../core/api';
import { formatCompactNumber } from '../../core/format';
import { getGameImage } from '../../core/game-images';

export interface FeaturedGame {
  slug: string;
  title: string;
  rating: number;
  likes: string;
  image: string;
}

interface ApiGame {
  slug: string;
  name: string;
  rating: number;
  likesCount: number;
}

export interface FeaturedGamesResponse {
  data: ApiGame[];
}

export const FEATURED_GAMES_URL: string = apiUrl('/games?featured=true');

export function parseFeaturedGames(response: FeaturedGamesResponse): FeaturedGame[] {
  return response.data.map((game: ApiGame): FeaturedGame => ({
    slug: game.slug,
    title: game.name,
    rating: game.rating,
    likes: formatCompactNumber(game.likesCount),
    image: getGameImage(game.slug),
  }));
}
