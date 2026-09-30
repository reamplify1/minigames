import { fetchJson } from '../../utils/api';

import camperVanMakeItHomeImage from '../../assets/images/games/camper-van-make-it-home-card.jpg';
import castNChillImage from '../../assets/images/games/cast-n-chill-card.jpg';
import catChessImage from '../../assets/images/games/cat-chess-card.jpg';
import catMailCoImage from '../../assets/images/games/cat-mail-co-card.png';
import cozySolitaireImage from '../../assets/images/games/cozy-solitaire-card.jpg';
import cozySudokuImage from '../../assets/images/games/cozy-sudoku-card.jpg';
import grimshireImage from '../../assets/images/games/grimshire-card.jpg';
import heartopiaImage from '../../assets/images/games/heartopia-card.png';
import islandersNewShoresImage from '../../assets/images/games/islanders-new-shores-card.jpg';
import koronekoImage from '../../assets/images/games/koroneko-card.jpg';
import leafItAloneImage from '../../assets/images/games/leaf-it-alone-card.jpg';
import leafyCornerImage from '../../assets/images/games/leafy-corner-card.jpg';
import littleCornersImage from '../../assets/images/games/little-corners-card.jpg';
import organizedInsideImage from '../../assets/images/games/organized-inside-card.jpg';
import paliaImage from '../../assets/images/games/palia-card.png';
import shelveThePotionsImage from '../../assets/images/games/shelve-the-potions-card.jpg';
import tailsideCozyCafeSimImage from '../../assets/images/games/tailside-cozy-cafe-sim-card.jpg';
import theWildAtHeartImage from '../../assets/images/games/the-wild-at-heart-card.jpg';
import tinyGladeImage from '../../assets/images/games/tiny-glade-card.jpg';
import tukoniForestKeepersImage from '../../assets/images/games/tukoni-forest-keepers.jpg';
import vacationCafeSimulatorImage from '../../assets/images/games/vacation-cafe-simulator-card.jpg';
import whisperOfTheHouseImage from '../../assets/images/games/whisper-of-the-house-card.jpg';
import winterBurrowImage from '../../assets/images/games/winter-burrow-card.jpg';
import wytchwoodImage from '../../assets/images/games/wytchwood-card.jpg';

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

interface ApiGamesMeta {
  page: number;
  totalPages: number;
}

interface GamesResponse {
  data: ApiGame[];
  meta: ApiGamesMeta;
}

export const IMAGE_BY_SLUG: Record<string, string> = {
  'camper-van-make-it-home': camperVanMakeItHomeImage,
  'cast-n-chill': castNChillImage,
  'cat-chess': catChessImage,
  'cat-mail-co': catMailCoImage,
  'cozy-solitaire': cozySolitaireImage,
  'cozy-sudoku': cozySudokuImage,
  grimshire: grimshireImage,
  heartopia: heartopiaImage,
  'islanders-new-shores': islandersNewShoresImage,
  koroneko: koronekoImage,
  'leaf-it-alone': leafItAloneImage,
  'leafy-corner': leafyCornerImage,
  'little-corners': littleCornersImage,
  'organized-inside': organizedInsideImage,
  palia: paliaImage,
  'shelve-the-potions': shelveThePotionsImage,
  'tailside-cozy-cafe-sim': tailsideCozyCafeSimImage,
  'the-wild-at-heart': theWildAtHeartImage,
  'tiny-glade': tinyGladeImage,
  'tukoni-forest-keepers': tukoniForestKeepersImage,
  'vacation-cafe-simulator': vacationCafeSimulatorImage,
  'whisper-of-the-house': whisperOfTheHouseImage,
  'winter-burrow': winterBurrowImage,
  wytchwood: wytchwoodImage,
};

export const FALLBACK_IMAGE = vacationCafeSimulatorImage;

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
  page: number;
}

export interface GamesMeta {
  page: number;
  totalPages: number;
}

export interface LibraryGamesResult {
  games: Game[];
  meta: GamesMeta;
}

export async function fetchLibraryGames(filters: GameFilters): Promise<LibraryGamesResult> {
  const queryParameters = new URLSearchParams({
    category: filters.category,
    sort: filters.sort,
    page: String(filters.page),
    limit: '6',
  });
  const response = await fetchJson<GamesResponse>(`/games?${queryParameters.toString()}`);

  return {
    games: response.data.map((game) => mapGame(game)),
    meta: {
      page: response.meta.page,
      totalPages: response.meta.totalPages,
    },
  };
}
