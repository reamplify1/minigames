import { fetchJson } from '../../utils/api';

import catMailCoImage from '../../assets/images/games/cat-mail-co-card.png';
import islandersNewShoresImage from '../../assets/images/games/islanders-new-shores-card.jpg';
import tinyGladeImage from '../../assets/images/games/tiny-glade-card.jpg';
import tukoniForestKeepersImage from '../../assets/images/games/tukoni-forest-keepers.jpg';
import vacationCafeSimulatorImage from '../../assets/images/games/vacation-cafe-simulator-card.jpg';
import winterBurrowImage from '../../assets/images/games/winter-burrow-card.jpg';

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

interface ApiGame {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
}

interface GamesResponse {
  data: ApiGame[];
}

const IMAGE_BY_SLUG: Record<string, string> = {
  'cat-mail-co': catMailCoImage,
  'islanders-new-shores': islandersNewShoresImage,
  'tiny-glade': tinyGladeImage,
  'tukoni-forest-keepers': tukoniForestKeepersImage,
  'vacation-cafe-simulator': vacationCafeSimulatorImage,
  'winter-burrow': winterBurrowImage,
};

const FALLBACK_IMAGE = vacationCafeSimulatorImage;

function formatLikes(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function formatGenre(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function mapGame(game: ApiGame): Game {
  return {
    id: game.slug,
    title: game.name,
    genre: formatGenre(game.category),
    price: game.price,
    description: game.shortDescription,
    rating: game.rating,
    likes: formatLikes(game.likesCount),
    cover: IMAGE_BY_SLUG[game.slug] ?? FALLBACK_IMAGE,
  };
}

export interface GameFilters {
  category: string;
  sort: string;
}

export async function fetchLibraryGames(filters: GameFilters): Promise<Game[]> {
  const queryParameters = new URLSearchParams({
    category: filters.category,
    sort: filters.sort,
    limit: '6',
  });
  const response = await fetchJson<GamesResponse>(`/games?${queryParameters.toString()}`);
  return response.data.map((game) => mapGame(game));
}
