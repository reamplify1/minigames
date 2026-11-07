import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isNetworkError } from '../../../core/api';
import { AuthService } from '../../../core/auth.service';
import { DialogNavigationService } from '../../../core/dialog-navigation.service';
import { SnackbarService } from '../../../core/snackbar.service';
import { GameCommentCard } from './game-comment';
import {
  type CommentsResponse,
  CommentsService,
  type GameCommentsResult,
  getCommentsUrl,
  parseComments,
} from './game-comments.data';

const COMMENT_INPUT_MAX_HEIGHT: number = 88;
const COMMENT_MAX_LENGTH: number = 500;

const COMMENT_LENGTH_ERROR_MESSAGE: string = 'Comment must be between 1 and 500 characters.';
const COMMENT_POST_ERROR_MESSAGE: string = 'Could not post your comment. Please try again.';
const COMMENT_POST_UNKNOWN_MESSAGE: string =
  "We couldn't confirm your comment was sent. Please check before trying again.";

const AVATAR_COLORS: string[] = ['blue', 'yellow', 'green', 'pink', 'lavender'];

function parsePixels(value: string): number {
  return Number(value.replace('px', '')) || 0;
}

@Component({
  selector: 'app-game-comments',
  imports: [GameCommentCard],
  templateUrl: './game-comments.html',
  styleUrl: './game-comments.states.scss',
})
export class GameComments {
  readonly slug = input.required<string>();

  private readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly commentsService: CommentsService = inject(CommentsService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly commentsResource = httpResource<CommentsResponse>((): string =>
    getCommentsUrl(this.slug(), untracked(this.auth.session)?.email)
  );

  protected readonly result = computed<GameCommentsResult | undefined>(
    (): GameCommentsResult | undefined =>
      this.commentsResource.hasValue() ? parseComments(this.commentsResource.value()) : undefined
  );

  protected readonly skeletonComments: number[] = [1, 2, 3];
  protected readonly text = signal<string>('');
  private readonly isSending = signal<boolean>(false);

  protected readonly isFormLocked = computed<boolean>(
    (): boolean => !this.auth.session() || this.isSending()
  );
  protected readonly canSubmit = computed<boolean>(
    (): boolean => !this.isFormLocked() && this.text().trim().length > 0
  );
  protected readonly userInitial = computed<string>(
    (): string => this.auth.session()?.displayName.charAt(0).toUpperCase() ?? ''
  );

  private readonly colorByAuthor: Map<string, string> = new Map<string, string>();

  constructor() {
    effect((): void => {
      if (this.commentsResource.error()) {
        this.snackbar.show('Could not load comments.', 'error');
      }
    });
  }

  protected getAvatarColor(author: string): string {
    let color = this.colorByAuthor.get(author);

    if (!color) {
      color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] ?? 'blue';
      this.colorByAuthor.set(author, color);
    }

    return color;
  }

  protected onInput(value: string): void {
    this.text.set(value);
    this.resizeTextarea();
  }

  protected onKeydown(event: KeyboardEvent, form: HTMLFormElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.dialogs.runProtected((): void => {
      void this.submitComment();
    });
  }

  private async submitComment(): Promise<void> {
    const session = this.auth.session();
    const text = this.text().trim();

    if (!session || this.isSending()) {
      return;
    }

    if (text.length === 0 || text.length > COMMENT_MAX_LENGTH) {
      this.snackbar.show(COMMENT_LENGTH_ERROR_MESSAGE, 'error');
      return;
    }

    this.isSending.set(true);

    try {
      await this.commentsService.post(this.slug(), {
        userEmail: session.email,
        authorName: session.displayName,
        text,
      });

      this.text.set('');
      this.textarea().nativeElement.value = '';
      this.resizeTextarea();
      this.commentsResource.reload();
    } catch (error) {
      this.snackbar.show(
        isNetworkError(error) ? COMMENT_POST_UNKNOWN_MESSAGE : COMMENT_POST_ERROR_MESSAGE,
        'error'
      );
    } finally {
      this.isSending.set(false);
    }
  }

  private resizeTextarea(): void {
    const textarea = this.textarea().nativeElement;

    textarea.style.height = 'auto';

    const { borderTopWidth, borderBottomWidth } = getComputedStyle(textarea);
    const borders = parsePixels(borderTopWidth) + parsePixels(borderBottomWidth);
    const contentHeight = textarea.scrollHeight + borders;

    textarea.style.height = `${Math.min(contentHeight, COMMENT_INPUT_MAX_HEIGHT)}px`;
    textarea.style.overflowY = contentHeight > COMMENT_INPUT_MAX_HEIGHT ? 'auto' : 'hidden';
  }
}
