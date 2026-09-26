const DRAG_THRESHOLD = 5;
const DRAGGING_CLASS = 'is-dragging';

export function enableDragScroll(container: HTMLElement): void {
  let isPointerDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  container.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    startX = event.clientX;
    startScrollLeft = container.scrollLeft;
  });

  container.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;

    const deltaX = event.clientX - startX;
    if (!hasDragged && Math.abs(deltaX) < DRAG_THRESHOLD) return;

    if (!hasDragged) {
      hasDragged = true;
      container.setPointerCapture(event.pointerId);
      container.classList.add(DRAGGING_CLASS);
    }

    container.scrollLeft = startScrollLeft - deltaX;
  });

  const stopDrag = (event: PointerEvent): void => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.classList.remove(DRAGGING_CLASS);
    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
  };

  container.addEventListener('pointerup', stopDrag);
  container.addEventListener('pointercancel', stopDrag);

  container.addEventListener(
    'click',
    (event) => {
      if (!hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
      hasDragged = false;
    },
    { capture: true }
  );
}
