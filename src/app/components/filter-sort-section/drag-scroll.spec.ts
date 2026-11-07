import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragScroll } from './drag-scroll';

@Component({
  imports: [DragScroll],
  template: `<ul appDragScroll>
    <li><button type="button" (click)="clicks = clicks + 1">Chip</button></li>
  </ul>`,
})
class TestHost {
  clicks = 0;
}

function pointer(type: string, clientX: number): MouseEvent {
  const event = new MouseEvent(type, { clientX, bubbles: true });
  Object.defineProperties(event, {
    pointerType: { value: 'mouse' },
    pointerId: { value: 1 },
  });
  return event;
}

describe('DragScroll', () => {
  let fixture: ComponentFixture<TestHost>;
  let list: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    list = (fixture.nativeElement as HTMLElement).querySelector('ul') as HTMLElement;
    list.setPointerCapture = vi.fn();
    list.releasePointerCapture = vi.fn();
    list.hasPointerCapture = vi.fn().mockReturnValue(true);
    list.scrollLeft = 100;
  });

  it('scrolls while dragging', () => {
    list.dispatchEvent(pointer('pointerdown', 200));
    list.dispatchEvent(pointer('pointermove', 150));

    expect(list.scrollLeft).toBe(150);
    expect(list.classList.contains('is-dragging')).toBe(true);
  });

  it('ignores small movements, so a shaky click stays a click', () => {
    list.dispatchEvent(pointer('pointerdown', 200));
    list.dispatchEvent(pointer('pointermove', 198));

    expect(list.scrollLeft).toBe(100);
  });

  it('cancels the click that follows a drag', () => {
    list.dispatchEvent(pointer('pointerdown', 200));
    list.dispatchEvent(pointer('pointermove', 150));
    list.dispatchEvent(pointer('pointerup', 150));
    list.querySelector('button')?.click();

    expect(fixture.componentInstance.clicks).toBe(0);
    expect(list.classList.contains('is-dragging')).toBe(false);
  });

  it('lets a normal click through', () => {
    list.querySelector('button')?.click();
    expect(fixture.componentInstance.clicks).toBe(1);
  });
});
