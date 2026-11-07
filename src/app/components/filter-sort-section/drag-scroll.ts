import { Directive, ElementRef, inject } from '@angular/core';

const DRAG_THRESHOLD: number = 5;
const DRAGGING_CLASS: string = 'is-dragging';

@Directive({
  selector: '[appDragScroll]',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'stopDrag($event)',
    '(pointercancel)': 'stopDrag($event)',
  },
})
export class DragScroll {
  private readonly container: HTMLElement =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private isPointerDown: boolean = false;
  private hasDragged: boolean = false;
  private startX: number = 0;
  private startScrollLeft: number = 0;

  constructor() {
    this.container.addEventListener(
      'click',
      (event: PointerEvent): void => {
        if (this.hasDragged) {
          event.preventDefault();
          event.stopPropagation();
          this.hasDragged = false;
        }
      },
      { capture: true }
    );
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    this.isPointerDown = true;
    this.hasDragged = false;
    this.startX = event.clientX;
    this.startScrollLeft = this.container.scrollLeft;
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isPointerDown) {
      return;
    }

    const deltaX = event.clientX - this.startX;

    if (!this.hasDragged && Math.abs(deltaX) < DRAG_THRESHOLD) {
      return;
    }

    if (!this.hasDragged) {
      this.hasDragged = true;
      this.container.setPointerCapture(event.pointerId);
      this.container.classList.add(DRAGGING_CLASS);
    }

    this.container.scrollLeft = this.startScrollLeft - deltaX;
  }

  protected stopDrag(event: PointerEvent): void {
    if (!this.isPointerDown) {
      return;
    }

    this.isPointerDown = false;
    this.container.classList.remove(DRAGGING_CLASS);

    if (this.container.hasPointerCapture(event.pointerId)) {
      this.container.releasePointerCapture(event.pointerId);
    }
  }
}
