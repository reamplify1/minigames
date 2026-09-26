import heroImage from '../../../assets/images/games/tukoni-forest-keepers.jpg';
import closeIcon from '../../../assets/icons/close-blue-icon.svg';

export function createGameHero(title: string, onClose: () => void): HTMLElement {
  const hero = document.createElement('header');
  hero.className = 'game-details-dialog__hero';
  hero.innerHTML = `
    <img class="game-details-dialog__hero-image" src="${heroImage}" alt="${title} artwork" />
    <button class="game-details-dialog__close" type="button" aria-label="Close dialog">
      <img class="game-details-dialog__close-icon" src="${closeIcon}" alt="" />
    </button>
  `;

  hero.querySelector('.game-details-dialog__close')?.addEventListener('click', onClose);

  return hero;
}
