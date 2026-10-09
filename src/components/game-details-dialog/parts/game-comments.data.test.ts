import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { fetchJsonMock, postJsonMock } = vi.hoisted(() => ({
  fetchJsonMock: vi.fn(),
  postJsonMock: vi.fn(),
}));

vi.mock('../../../utils/api', () => ({ fetchJson: fetchJsonMock, postJson: postJsonMock }));

import {
  formatRelativeTime,
  fetchGameComments,
  postGameComment,
  toggleCommentLike,
} from './game-comments.data';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function isoAgo(msAgo: number): string {
  return new Date(NOW.getTime() - msAgo).toISOString();
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "just now" for timestamps under a minute old', () => {
    expect(formatRelativeTime(isoAgo(30 * SECOND_MS))).toBe('just now');
  });

  it('shows minutes for timestamps under an hour old', () => {
    expect(formatRelativeTime(isoAgo(5 * MINUTE_MS))).toBe('5 min ago');
  });

  it('shows hours, singular and plural, for timestamps under a day old', () => {
    expect(formatRelativeTime(isoAgo(1 * HOUR_MS))).toBe('1 hour ago');
    expect(formatRelativeTime(isoAgo(3 * HOUR_MS))).toBe('3 hours ago');
  });

  it('shows days for timestamps under a week old', () => {
    expect(formatRelativeTime(isoAgo(2 * DAY_MS))).toBe('2 days ago');
  });

  it('shows weeks for timestamps under four weeks old', () => {
    expect(formatRelativeTime(isoAgo(2 * WEEK_MS))).toBe('2 weeks ago');
  });

  it('shows months for timestamps under a year old', () => {
    expect(formatRelativeTime(isoAgo(3 * MONTH_MS))).toBe('3 months ago');
  });

  it('shows years for timestamps a year old or more', () => {
    expect(formatRelativeTime(isoAgo(2 * YEAR_MS))).toBe('2 years ago');
  });
});

describe('fetchGameComments', () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it('requests the first page of newest comments without a userEmail when guest', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], meta: { totalComments: 0 } });

    await fetchGameComments('cozy-solitaire');

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/games/cozy-solitaire/comments?limit=3&sort=newest'
    );
  });

  it('adds an encoded userEmail query when authenticated', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], meta: { totalComments: 0 } });

    await fetchGameComments('cozy-solitaire', 'student+rs@school.com');

    expect(fetchJsonMock).toHaveBeenCalledWith(
      '/games/cozy-solitaire/comments?limit=3&sort=newest&userEmail=student%2Brs%40school.com'
    );
  });

  it('maps each comment and returns the total count', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          commentId: 'c1',
          authorName: 'ForestDweller',
          text: 'Love this game!',
          likesCount: 4,
          isLikedByCurrentUser: true,
          createdAt: new Date().toISOString(),
        },
      ],
      meta: { totalComments: 12 },
    });

    const result = await fetchGameComments('cozy-solitaire');

    expect(result).toEqual({
      comments: [
        {
          commentId: 'c1',
          author: 'ForestDweller',
          date: 'just now',
          text: 'Love this game!',
          likes: 4,
          isLiked: true,
        },
      ],
      total: 12,
    });
  });
});

describe('postGameComment', () => {
  beforeEach(() => {
    postJsonMock.mockReset();
  });

  it('posts the comment payload to the game comments endpoint', async () => {
    postJsonMock.mockResolvedValue({ data: {} });

    await postGameComment('cozy-solitaire', {
      userEmail: 'student@rs.school',
      authorName: 'ForestDweller',
      text: 'Great game!',
    });

    expect(postJsonMock).toHaveBeenCalledWith('/games/cozy-solitaire/comments', {
      userEmail: 'student@rs.school',
      authorName: 'ForestDweller',
      text: 'Great game!',
    });
  });
});

describe('toggleCommentLike', () => {
  beforeEach(() => {
    postJsonMock.mockReset();
  });

  it('posts to the comment like endpoint and returns the new like state', async () => {
    postJsonMock.mockResolvedValue({ data: { isLikedByCurrentUser: true, likesCount: 5 } });

    const result = await toggleCommentLike('c1', 'student@rs.school');

    expect(postJsonMock).toHaveBeenCalledWith('/comments/c1/like', {
      userEmail: 'student@rs.school',
    });
    expect(result).toEqual({ isLikedByCurrentUser: true, likesCount: 5 });
  });
});
