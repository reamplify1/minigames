import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiNetworkError } from '../../../utils/api';

const {
  getCurrentSessionMock,
  onAuthStateChangeMock,
  showSnackbarMock,
  fetchGameCommentsMock,
  postGameCommentMock,
  toggleCommentLikeMock,
} = vi.hoisted(() => ({
  getCurrentSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(),
  showSnackbarMock: vi.fn(),
  fetchGameCommentsMock: vi.fn(),
  postGameCommentMock: vi.fn(),
  toggleCommentLikeMock: vi.fn(),
}));

vi.mock('../../../app/auth-state', () => ({
  getCurrentSession: getCurrentSessionMock,
  onAuthStateChange: onAuthStateChangeMock,
  checkSessionExpiration: vi.fn(),
}));

vi.mock('../../snackbar/snackbar', () => ({ showSnackbar: showSnackbarMock }));

vi.mock('./game-comments.data', () => ({
  fetchGameComments: fetchGameCommentsMock,
  postGameComment: postGameCommentMock,
  toggleCommentLike: toggleCommentLikeMock,
}));

import { createGameComments } from './game-comments';

const SESSION = {
  displayName: 'ForestDweller',
  email: 'student@rs.school',
  authenticatedAt: Date.now(),
};

interface CommentOverrides {
  commentId?: string;
  likes?: number;
  isLiked?: boolean;
}

function buildComment(overrides: CommentOverrides = {}) {
  return {
    commentId: overrides.commentId ?? 'c1',
    author: 'ForestDweller',
    date: 'just now',
    text: 'Great game!',
    likes: overrides.likes ?? 3,
    isLiked: overrides.isLiked ?? false,
  };
}

async function mountComments(): Promise<HTMLElement> {
  const section = createGameComments('cozy-solitaire');
  document.body.replaceChildren(section);
  await vi.waitFor(() => expect(fetchGameCommentsMock).toHaveBeenCalled());

  return section;
}

describe('createGameComments', () => {
  beforeEach(() => {
    getCurrentSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    showSnackbarMock.mockClear();
    fetchGameCommentsMock.mockReset();
    postGameCommentMock.mockReset();
    toggleCommentLikeMock.mockReset();
    fetchGameCommentsMock.mockResolvedValue({ comments: [buildComment()], total: 1 });
  });

  it('loads and renders the comment list on mount', async () => {
    const section = await mountComments();

    await vi.waitFor(() =>
      expect(section.querySelectorAll('.game-details-dialog__comment')).toHaveLength(1)
    );
    expect(section.querySelector('.game-details-dialog__comments-title')?.textContent).toBe(
      'Comments (1)'
    );
  });

  describe('submitting a comment', () => {
    it('keeps the submit button disabled for a guest', async () => {
      getCurrentSessionMock.mockReturnValue(undefined);
      const section = await mountComments();

      const submitButton = section.querySelector<HTMLButtonElement>(
        '.game-details-dialog__comment-submit'
      );

      expect(submitButton?.disabled).toBe(true);
    });

    it('posts the comment and refreshes the list on success', async () => {
      getCurrentSessionMock.mockReturnValue(SESSION);
      postGameCommentMock.mockResolvedValue(undefined);
      const section = await mountComments();

      const textarea = section.querySelector<HTMLTextAreaElement>(
        '.game-details-dialog__comment-input'
      );
      if (!textarea) {
        throw new Error('Comment textarea not found.');
      }
      textarea.value = 'Loved every minute of it!';
      textarea.dispatchEvent(new Event('input'));

      fetchGameCommentsMock.mockResolvedValue({
        comments: [buildComment(), buildComment({ commentId: 'c2' })],
        total: 2,
      });

      section.querySelector('form')?.requestSubmit();

      await vi.waitFor(() => expect(postGameCommentMock).toHaveBeenCalled());
      expect(postGameCommentMock).toHaveBeenCalledWith('cozy-solitaire', {
        userEmail: SESSION.email,
        authorName: SESSION.displayName,
        text: 'Loved every minute of it!',
      });

      await vi.waitFor(() =>
        expect(section.querySelector('.game-details-dialog__comments-title')?.textContent).toBe(
          'Comments (2)'
        )
      );
      expect(textarea.value).toBe('');
    });

    it('shows the "unknown outcome" message (not the generic one) when posting fails with a network error', async () => {
      getCurrentSessionMock.mockReturnValue(SESSION);
      postGameCommentMock.mockRejectedValue(new ApiNetworkError('Network error'));
      const section = await mountComments();

      const textarea = section.querySelector<HTMLTextAreaElement>(
        '.game-details-dialog__comment-input'
      );
      if (!textarea) {
        throw new Error('Comment textarea not found.');
      }
      textarea.value = 'Loved every minute of it!';
      textarea.dispatchEvent(new Event('input'));

      section.querySelector('form')?.requestSubmit();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          "We couldn't confirm your comment was sent. Please check before trying again.",
          'error'
        )
      );
    });
  });

  describe('liking a comment', () => {
    it('does nothing for a guest and shows the guest message', async () => {
      getCurrentSessionMock.mockReturnValue(undefined);
      const section = await mountComments();
      await vi.waitFor(() =>
        expect(section.querySelector('.game-details-dialog__like')).not.toBeNull()
      );

      const likeButton = section.querySelector<HTMLButtonElement>('.game-details-dialog__like');
      likeButton?.click();

      expect(toggleCommentLikeMock).not.toHaveBeenCalled();
      expect(showSnackbarMock).toHaveBeenCalledWith('Log in to like comments.', 'error');
    });

    it('toggles the like state and count on success', async () => {
      getCurrentSessionMock.mockReturnValue(SESSION);
      toggleCommentLikeMock.mockResolvedValue({ isLikedByCurrentUser: true, likesCount: 4 });
      const section = await mountComments();
      await vi.waitFor(() =>
        expect(section.querySelector('.game-details-dialog__like')).not.toBeNull()
      );

      const likeButton = section.querySelector<HTMLButtonElement>('.game-details-dialog__like');
      likeButton?.click();

      await vi.waitFor(() =>
        expect(toggleCommentLikeMock).toHaveBeenCalledWith('c1', SESSION.email)
      );
      await vi.waitFor(() => expect(likeButton?.getAttribute('aria-pressed')).toBe('true'));
      expect(likeButton?.querySelector('.game-details-dialog__like-count')?.textContent).toBe('4');
      expect(likeButton?.disabled).toBe(false);
    });

    it('shows an error and leaves the pressed state unchanged when the request fails', async () => {
      getCurrentSessionMock.mockReturnValue(SESSION);
      toggleCommentLikeMock.mockRejectedValue(new Error('server error'));
      const section = await mountComments();
      await vi.waitFor(() =>
        expect(section.querySelector('.game-details-dialog__like')).not.toBeNull()
      );

      const likeButton = section.querySelector<HTMLButtonElement>('.game-details-dialog__like');
      likeButton?.click();

      await vi.waitFor(() =>
        expect(showSnackbarMock).toHaveBeenCalledWith(
          'Could not update like. Please try again.',
          'error'
        )
      );
      expect(likeButton?.getAttribute('aria-pressed')).toBe('false');
      expect(likeButton?.disabled).toBe(false);
    });
  });
});
