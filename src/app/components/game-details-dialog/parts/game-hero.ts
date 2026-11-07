import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-game-hero',
  template: `
    <header class="game-details-dialog__hero">
      <img class="game-details-dialog__hero-image" [src]="image()" [alt]="title() + ' artwork'" />
      <button
        class="game-details-dialog__close"
        type="button"
        aria-label="Close dialog"
        (click)="closed.emit()"
      >
        <img
          class="game-details-dialog__close-icon"
          src="assets/icons/close-blue-icon.svg"
          alt=""
        />
      </button>
    </header>
  `,
})
export class GameHero {
  readonly title = input.required<string>();
  readonly image = input.required<string>();
  readonly closed = output<void>();
}
