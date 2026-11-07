import { afterRenderEffect, Component, ElementRef, inject, viewChild } from '@angular/core';
import { SnackbarService } from '../../core/snackbar.service';

@Component({
  selector: 'app-snackbar-host',
  template: `
    <div #container class="snackbar-container" aria-live="polite" popover="manual">
      @for (message of snackbar.messages(); track message.id) {
        <div class="snackbar snackbar--{{ message.variant }}" role="status">
          <span class="snackbar__text">{{ message.text }}</span>
          <button
            class="snackbar__close"
            type="button"
            aria-label="Dismiss notification"
            (click)="snackbar.dismiss(message.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './snackbar.scss',
})
export class SnackbarHost {
  protected readonly snackbar: SnackbarService = inject(SnackbarService);

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  constructor() {
    afterRenderEffect((): void => {
      this.snackbar.messages();
      this.moveToTop(this.container().nativeElement);
    });
  }

  private moveToTop(container: HTMLElement): void {
    try {
      if (container.matches(':popover-open')) {
        container.hidePopover();
      }

      container.showPopover();
    } catch {
      return;
    }
  }
}
