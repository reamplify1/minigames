import { describe, it, expect, vi } from 'vitest';
import { createGameHero } from './game-hero';

describe('createGameHero', () => {
  it('shows the game artwork with an accessible alt text', () => {
    const hero = createGameHero('Cozy Solitaire', 'cover.jpg', vi.fn());

    const image = hero.querySelector<HTMLImageElement>('.game-details-dialog__hero-image');

    expect(image?.getAttribute('src')).toBe('cover.jpg');
    expect(image?.alt).toBe('Cozy Solitaire artwork');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    const hero = createGameHero('Cozy Solitaire', 'cover.jpg', onClose);

    hero.querySelector<HTMLButtonElement>('.game-details-dialog__close')?.click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
