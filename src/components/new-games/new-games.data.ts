import { fetchJson } from '../../utils/api';

import catMailCoImage from '../../assets/images/games/cat-mail-co-card.png';
import heartopiaImage from '../../assets/images/games/heartopia-card.png';
import islandersNewShoresImage from '../../assets/images/games/islanders-new-shores-card.jpg';
import paliaImage from '../../assets/images/games/palia-card.png';
import shelveThePotionsImage from '../../assets/images/games/shelve-the-potions-card.jpg';
import tailsideCozyCafeSimImage from '../../assets/images/games/tailside-cozy-cafe-sim-card.jpg';
import tinyGladeImage from '../../assets/images/games/tiny-glade-card.jpg';
import vacationCafeSimulatorImage from '../../assets/images/games/vacation-cafe-simulator-card.jpg';
import winterBurrowImage from '../../assets/images/games/winter-burrow-card.jpg';

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

interface GamesResponse {
  data: ApiGame[];
}

// The API's cardImage path does not resolve to a real hosted file, so featured
// games are matched by slug to the local assets from tasks/assets instead.
const IMAGE_BY_SLUG: Record<string, string> = {
  'cat-mail-co': catMailCoImage,
  heartopia: heartopiaImage,
  'islanders-new-shores': islandersNewShoresImage,
  palia: paliaImage,
  'shelve-the-potions': shelveThePotionsImage,
  'tailside-cozy-cafe-sim': tailsideCozyCafeSimImage,
  'tiny-glade': tinyGladeImage,
  'vacation-cafe-simulator': vacationCafeSimulatorImage,
  'winter-burrow': winterBurrowImage,
};

const FALLBACK_IMAGE = vacationCafeSimulatorImage;

function formatLikes(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
}

function mapGame(game: ApiGame): FeaturedGame {
  return {
    slug: game.slug,
    title: game.name,
    rating: game.rating,
    likes: formatLikes(game.likesCount),
    image: IMAGE_BY_SLUG[game.slug] ?? FALLBACK_IMAGE,
  };
}

export async function fetchFeaturedGames(): Promise<FeaturedGame[]> {
  const response = await fetchJson<GamesResponse>('/games?featured=true');
  return response.data.map((game) => mapGame(game));
}
