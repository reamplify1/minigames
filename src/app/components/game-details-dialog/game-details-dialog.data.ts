import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { type ApiResponse, apiUrl } from '../../core/api';
import { formatRelativeTime } from '../../core/format';
import { getGameImage } from '../../core/game-images';

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
  likesCount: number;
  isFavorited: boolean;
  description: string;
  info: GameInfoItem[];
  records: GameRecord[];
}

export interface FavoriteToggleResult {
  isFavorited: boolean;
  likesCount: number;
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
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: ApiGameSpecs;
  topRecords: ApiGameRecord[];
}

export interface GameDetailsResponse {
  data: ApiGameDetails;
}

function mapRecord(record: ApiGameRecord): GameRecord {
  return {
    player: record.playerName,
    score: `${record.score.toLocaleString('en-US')} pts`,
    date: formatRelativeTime(record.achievedAt),
  };
}

export function parseGameDetails({ data: game }: GameDetailsResponse): GameDetails {
  return {
    title: game.name,
    heroImage: getGameImage(game.slug),
    rating: String(game.rating),
    likesCount: game.likesCount,
    isFavorited: game.isLikedByCurrentUser,
    description: game.fullDescription,
    info: [
      { label: 'Genre', value: game.specs.genre },
      { label: 'Players', value: game.specs.players },
      { label: 'Duration', value: game.specs.duration },
      { label: 'Price', value: game.specs.price },
    ],
    records: game.topRecords.map((record: ApiGameRecord): GameRecord => mapRecord(record)),
  };
}

export function getGameDetailsUrl(slug: string, userEmail?: string): string {
  const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return apiUrl(`/games/${slug}${query}`);
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http: HttpClient = inject(HttpClient);

  async toggle(slug: string, userEmail: string): Promise<FavoriteToggleResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<FavoriteToggleResult>>(apiUrl(`/games/${slug}/favorite`), {
        userEmail,
      })
    );

    return response.data;
  }
}
