import { fetchJson, postJson } from '../../../utils/api';

export interface GameComment {
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

interface ApiComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

interface ApiCommentsMeta {
  totalComments: number;
}

interface ApiCommentsResponse {
  data: ApiComment[];
  meta: ApiCommentsMeta;
}

interface ApiCommentResponse {
  data: ApiComment;
}

const COMMENTS_LIMIT = 3;

const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const FOUR_WEEKS_IN_MS = 4 * WEEK_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;
const MAX_DISPLAYED_MONTHS = 11;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatUnit(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}

export function formatRelativeTime(isoDate: string): string {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();

  if (elapsedMs < MINUTE_IN_MS) return 'just now';
  if (elapsedMs < HOUR_IN_MS) return `${Math.floor(elapsedMs / MINUTE_IN_MS)} min ago`;
  if (elapsedMs < DAY_IN_MS) return formatUnit(Math.floor(elapsedMs / HOUR_IN_MS), 'hour');
  if (elapsedMs < WEEK_IN_MS) return formatUnit(Math.floor(elapsedMs / DAY_IN_MS), 'day');
  if (elapsedMs < FOUR_WEEKS_IN_MS) return formatUnit(Math.floor(elapsedMs / WEEK_IN_MS), 'week');

  if (elapsedMs < YEAR_IN_MS) {
    const months = clamp(Math.floor(elapsedMs / MONTH_IN_MS), 1, MAX_DISPLAYED_MONTHS);
    return formatUnit(months, 'month');
  }

  return formatUnit(Math.floor(elapsedMs / YEAR_IN_MS), 'year');
}

function mapComment(comment: ApiComment): GameComment {
  return {
    author: comment.authorName,
    date: formatRelativeTime(comment.createdAt),
    text: comment.text,
    likes: comment.likesCount,
    isLiked: comment.isLikedByCurrentUser,
  };
}

export async function fetchGameComments(
  slug: string,
  userEmail?: string
): Promise<GameCommentsResult> {
  const emailQuery = userEmail ? `&userEmail=${encodeURIComponent(userEmail)}` : '';
  const response = await fetchJson<ApiCommentsResponse>(
    `/games/${slug}/comments?limit=${COMMENTS_LIMIT}&sort=newest${emailQuery}`
  );

  return {
    comments: response.data.map((comment) => mapComment(comment)),
    total: response.meta.totalComments,
  };
}

export async function postGameComment(slug: string, payload: NewCommentPayload): Promise<void> {
  await postJson<ApiCommentResponse>(`/games/${slug}/comments`, payload);
}
