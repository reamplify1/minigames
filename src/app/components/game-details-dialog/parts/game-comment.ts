import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { isNetworkError } from '../../../core/api';
import { AuthService } from '../../../core/auth.service';
import { DialogNavigationService } from '../../../core/dialog-navigation.service';
import { SnackbarService } from '../../../core/snackbar.service';
import { CommentsService, type GameComment } from './game-comments.data';

const GUEST_LIKE_MESSAGE: string = 'Log in to like comments.';
const LIKE_ERROR_MESSAGE: string = 'Could not update like. Please try again.';
const LIKE_UNKNOWN_MESSAGE: string =
  "We couldn't confirm your like. Please check before trying again.";

@Component({
  selector: 'app-game-comment',
  template: `
    <article class="game-details-dialog__comment">
      <header class="game-details-dialog__comment-header">
        <span class="game-details-dialog__comment-author">
          <span
            class="game-details-dialog__comment-avatar game-details-dialog__comment-avatar--{{
              avatarColor()
            }}"
            aria-hidden="true"
          >
            {{ comment().author.trim().charAt(0).toUpperCase() }}
          </span>
          <span class="game-details-dialog__comment-name">{{ comment().author }}</span>
        </span>
        <span class="game-details-dialog__comment-date">{{ comment().date }}</span>
      </header>
      <p class="game-details-dialog__comment-text">{{ comment().text }}</p>
      <footer class="game-details-dialog__comment-footer">
        <button
          class="game-details-dialog__like"
          type="button"
          [class.game-details-dialog__like--pending]="isSaving()"
          [attr.aria-pressed]="isLiked()"
          [attr.aria-busy]="isSaving() ? 'true' : null"
          [attr.aria-label]="'Like comment by ' + comment().author + ', ' + likes() + ' likes'"
          [disabled]="isSaving()"
          (click)="onLikeClick()"
        >
          <img class="game-details-dialog__like-icon" src="assets/icons/fav-icon.svg" alt="" />
          <span class="game-details-dialog__like-count">{{ likes() }}</span>
        </button>
      </footer>
    </article>
  `,
})
export class GameCommentCard {
  readonly comment = input.required<GameComment>();
  readonly avatarColor = input.required<string>();

  private readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly commentsService: CommentsService = inject(CommentsService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  protected readonly isLiked = linkedSignal<boolean>(
    (): boolean => this.comment().isLiked && this.auth.session() !== undefined
  );
  protected readonly likes = linkedSignal<number>((): number => this.comment().likes);
  protected readonly isSaving = signal<boolean>(false);

  protected onLikeClick(): void {
    this.dialogs.runProtected((): void => {
      void this.toggleLike();
    }, GUEST_LIKE_MESSAGE);
  }

  private async toggleLike(): Promise<void> {
    const userEmail = this.auth.session()?.email;

    if (!userEmail || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    try {
      const result = await this.commentsService.toggleLike(this.comment().commentId, userEmail);
      this.isLiked.set(result.isLikedByCurrentUser);
      this.likes.set(result.likesCount);
    } catch (error) {
      this.snackbar.show(
        isNetworkError(error) ? LIKE_UNKNOWN_MESSAGE : LIKE_ERROR_MESSAGE,
        'error'
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}
