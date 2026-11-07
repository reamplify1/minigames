import { NgTemplateOutlet } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { isNotFoundError } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { DialogNavigationService } from '../../core/dialog-navigation.service';
import { SnackbarService } from '../../core/snackbar.service';
import {
  type GameDetails,
  type GameDetailsResponse,
  getGameDetailsUrl,
  parseGameDetails,
} from './game-details-dialog.data';
import { GameComments } from './parts/game-comments';
import { GameHero } from './parts/game-hero';
import { GameInfo } from './parts/game-info';
import { GameRecords } from './parts/game-records';

@Component({
  selector: 'app-game-details-dialog',
  imports: [NgTemplateOutlet, GameHero, GameInfo, GameRecords, GameComments],
  templateUrl: './game-details-dialog.html',
  styleUrls: ['./game-details-dialog.scss', './game-details-dialog.states.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GameDetailsDialog {
  readonly slug = input<string>();

  private readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);
  private readonly snackbar: SnackbarService = inject(SnackbarService);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly gameResource = httpResource<GameDetailsResponse>((): string | undefined => {
    const slug = this.slug();
    return slug ? getGameDetailsUrl(slug, untracked(this.auth.session)?.email) : undefined;
  });

  protected readonly game = computed<GameDetails | undefined>((): GameDetails | undefined =>
    this.gameResource.hasValue() ? parseGameDetails(this.gameResource.value()) : undefined
  );

  protected readonly isNotFound = computed<boolean>((): boolean =>
    isNotFoundError(this.gameResource.error())
  );

  constructor() {
    effect((): void => {
      const dialog = this.dialog().nativeElement;

      if (this.slug() && !dialog.open) {
        dialog.showModal();
        dialog.scrollTop = 0;
      } else if (!this.slug() && dialog.open) {
        dialog.close();
      }
    });

    effect((): void => {
      if (this.gameResource.error() && !this.isNotFound()) {
        this.snackbar.show('Could not load game details.', 'error');
      }
    });
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }

  protected onClose(): void {
    if (this.slug()) {
      this.dialogs.closeGame();
    }
  }
}
