import { describe, it, expect, vi } from 'vitest';
import { enableDragScroll } from './drag-scroll';

// A mouse "pointer" event. jsdom's MouseEvent has no pointerType or pointerId,
// so we add them by hand.
function pointerEvent(type: string, clientX: number, pointerType = 'mouse'): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button: 0 });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    pointerId: { value: 1 },
  });
  return event;
}

// jsdom has no layout or pointer capture, so the container gets a writable
// scrollLeft and fake pointer-capture methods.
function createContainer(): HTMLElement {
  const container = document.createElement('div');
  Object.defineProperty(container, 'scrollLeft', { value: 100, writable: true });
  container.setPointerCapture = vi.fn();
  container.releasePointerCapture = vi.fn();
  container.hasPointerCapture = vi.fn(() => true);
  enableDragScroll(container);
  return container;
}

describe('enableDragScroll', () => {
  it('scrolls the container when the mouse is dragged', () => {
    const container = createContainer();

    container.dispatchEvent(pointerEvent('pointerdown', 100));
    container.dispatchEvent(pointerEvent('pointermove', 60));

    expect(container.scrollLeft).toBe(140);
    expect(container.classList.contains('is-dragging')).toBe(true);
    expect(container.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('ignores tiny movements below the drag threshold', () => {
    const container = createContainer();

    container.dispatchEvent(pointerEvent('pointerdown', 100));
    container.dispatchEvent(pointerEvent('pointermove', 103));

    expect(container.scrollLeft).toBe(100);
    expect(container.classList.contains('is-dragging')).toBe(false);
  });

  it('ignores touch input and movement without a pressed button', () => {
    const container = createContainer();

    container.dispatchEvent(pointerEvent('pointermove', 20));
    container.dispatchEvent(pointerEvent('pointerdown', 100, 'touch'));
    container.dispatchEvent(pointerEvent('pointermove', 20));

    expect(container.scrollLeft).toBe(100);
  });

  it('stops dragging and releases the pointer when the mouse is released', () => {
    const container = createContainer();
    container.dispatchEvent(pointerEvent('pointerdown', 100));
    container.dispatchEvent(pointerEvent('pointermove', 60));

    container.dispatchEvent(pointerEvent('pointerup', 60));

    expect(container.classList.contains('is-dragging')).toBe(false);
    expect(container.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('blocks only the click that ends a drag', () => {
    const container = createContainer();
    container.dispatchEvent(pointerEvent('pointerdown', 100));
    container.dispatchEvent(pointerEvent('pointermove', 60));
    container.dispatchEvent(pointerEvent('pointercancel', 60));

    const clickAfterDrag = new MouseEvent('click', { bubbles: true, cancelable: true });
    container.dispatchEvent(clickAfterDrag);
    const normalClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    container.dispatchEvent(normalClick);

    expect(clickAfterDrag.defaultPrevented).toBe(true);
    expect(normalClick.defaultPrevented).toBe(false);
  });
});
