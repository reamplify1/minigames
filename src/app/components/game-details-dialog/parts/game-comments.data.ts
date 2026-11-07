import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { type ApiResponse, apiUrl } from '../../../core/api';
import { formatRelativeTime } from '../../../core/format';

const COMMENTS_LIMIT: number = 3;

export interface GameComment {
  commentId: string;
  author: string;
  date: string;
  text: string;
  likes: number;
  isLiked: boolean;
}

export interface GameCommentsResult {
  comments: GameComment[];
  total: number;
}

export interface NewCommentPayload {
  userEmail: string;
  authorName: string;
  text: string;
}

export interface LikeToggleResult {
  isLikedByCurrentUser: boolean;
  likesCount: number;
}

interface ApiComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface CommentsResponse {
  data: ApiComment[];
  meta: { totalComments: number };
}

function mapComment(comment: ApiComment): GameComment {
  return {
    commentId: comment.commentId,
    author: comment.authorName,
    date: formatRelativeTime(comment.createdAt),
    text: comment.text,
    likes: comment.likesCount,
    isLiked: comment.isLikedByCurrentUser,
  };
}

export function parseComments(response: CommentsResponse): GameCommentsResult {
  return {
    comments: response.data.map((comment: ApiComment): GameComment => mapComment(comment)),
    total: response.meta.totalComments,
  };
}

export function getCommentsUrl(slug: string, userEmail?: string): string {
  const emailQuery = userEmail ? `&userEmail=${encodeURIComponent(userEmail)}` : '';
  return apiUrl(`/games/${slug}/comments?limit=${COMMENTS_LIMIT}&sort=newest${emailQuery}`);
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http: HttpClient = inject(HttpClient);

  async post(slug: string, payload: NewCommentPayload): Promise<void> {
    await firstValueFrom(this.http.post(apiUrl(`/games/${slug}/comments`), payload));
  }

  async toggleLike(commentId: string, userEmail: string): Promise<LikeToggleResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<LikeToggleResult>>(apiUrl(`/comments/${commentId}/like`), {
        userEmail,
      })
    );

    return response.data;
  }
}
