import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { DialogNavigationService } from '../../../core/dialog-navigation.service';
import { formatCompactNumber } from '../../../core/format';
import { SnackbarService } from '../../../core/snackbar.service';
import { FavoritesService, type GameDetails } from '../game-details-dialog.data';

const FAVORITE_LABEL_ADD: string = 'Add to Favorites';
const FAVORITE_LABEL_REMOVE: string = 'Remove from Favorites';
const GUEST_FAVORITE_MESSAGE: string = 'Log in to add games to your favorites.';
const FAVORITE_ERROR_MESSAGE: string = 'Could not update favorites. Please try again.';

@Component({
  selector: 'app-game-info',
  template: `
    <div class="game-details-dialog__title-row">
      <h2 class="game-details-dialog__title" id="game-details-title">{{ game().title }}</h2>
      <div class="game-details-dialog__stats">
        <span class="game-details-dialog__stat">
          <img
            class="game-details-dialog__stat-icon"
            src="assets/icons/star-icon.svg"
            alt="Rating"
          />
          {{ game().rating }}
        </span>
        <span class="game-details-dialog__stat">
          <img
            class="game-details-dialog__stat-icon"
            src="assets/icons/favorite-icon.svg"
            alt="Likes"
          />
          <span class="game-details-dialog__stat-likes">{{ likes() }}</span>
        </span>
      </div>
    </div>

    <p class="game-details-dialog__description">{{ game().description }}</p>

    <ul class="game-details-dialog__info">
      @for (item of game().info; track item.label) {
        <li class="game-details-dialog__info-item">
          <span class="game-details-dialog__info-label">{{ item.label }}</span>
          <span class="game-details-dialog__info-value">{{ item.value }}</span>
        </li>
      }
    </ul>

    <div class="game-details-dialog__actions">
      <button class="game-details-dialog__play" type="button">Play Now</button>
      <button
        class="game-details-dialog__favorite"
        type="button"
        [attr.aria-pressed]="isFavorited()"
        [attr.aria-label]="favoriteLabel()"
        [disabled]="isSaving()"
        (click)="onFavoriteClick()"
      >
        <img class="game-details-dialog__heart" src="assets/icons/fav-icon.svg" alt="" />
        <span class="game-details-dialog__favorite-label">{{ favoriteLabel() }}</span>
      </button>
    </div>
  `,
})
export class GameInfo {
  readonly game = input.required<GameDetails>();
  readonly slug = input.required<string>();

  private readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly favorites: FavoritesService = inject(FavoritesService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  protected readonly isFavorited = linkedSignal<boolean>(
    (): boolean => this.game().isFavorited && this.auth.session() !== undefined
  );
  private readonly likesCount = linkedSignal<number>((): number => this.game().likesCount);

  protected readonly isSaving = signal<boolean>(false);
  protected readonly likes = computed<string>((): string => formatCompactNumber(this.likesCount()));
  protected readonly favoriteLabel = computed<string>((): string =>
    this.isFavorited() ? FAVORITE_LABEL_REMOVE : FAVORITE_LABEL_ADD
  );

  protected onFavoriteClick(): void {
    this.dialogs.runProtected((): void => {
      void this.toggleFavorite();
    }, GUEST_FAVORITE_MESSAGE);
  }

  private async toggleFavorite(): Promise<void> {
    const userEmail = this.auth.session()?.email;

    if (!userEmail || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    try {
      const result = await this.favorites.toggle(this.slug(), userEmail);
      this.isFavorited.set(result.isFavorited);
      this.likesCount.set(result.likesCount);
    } catch {
      this.snackbar.show(FAVORITE_ERROR_MESSAGE, 'error');
    } finally {
      this.isSaving.set(false);
    }
  }
}
