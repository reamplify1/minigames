import './game-card.scss';
import starIcon from '../../assets/icons/star-icon.svg';
import favoriteIcon from '../../assets/icons/favorite-icon.svg';

export type GameCardSize = 'outer' | 'side' | 'main';

export interface Game {
  title: string;
  rating: number;
  likes: string;
  image: string;
  size: GameCardSize;
}

export function createGameCard(game: Game): HTMLLIElement {
  const card = document.createElement('li');
  card.className = `game-card game-card--${game.size}`;
  card.innerHTML = `
    <img class="game-card__image" src="${game.image}" alt="${game.title}" />
    <div class="game-card__info">
      <h3 class="game-card__title">${game.title}</h3>
      <div class="game-card__stats">
        <span class="game-card__stat">
          <img class="game-card__stat-icon" src="${starIcon}" alt="" />
          <span>${game.rating.toFixed(1)}</span>
        </span>
        <span class="game-card__stat">
          <img class="game-card__stat-icon" src="${favoriteIcon}" alt="" />
          <span>${game.likes}</span>
        </span>
      </div>
    </div>
  `;
  return card;
}
