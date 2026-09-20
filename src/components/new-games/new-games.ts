import './new-games.scss';
import { createGameCard, type Game } from '../game-card/game-card';
import arrowLeftIcon from '../../assets/icons/arrow-left-icon.svg';
import arrowRightIcon from '../../assets/icons/arrow-right-icon.svg';
import tailsideImage from '../../assets/images/games/tailside-cozy-cafe-simcard.jpg';
import islandersImage from '../../assets/images/games/islanders-new-shores-card.jpg';
import vacationCafeImage from '../../assets/images/games/vacation-cafe-simulator.jpg';
import winterBurrowImage from '../../assets/images/games/winter-burrow-card.jpg';
import shelvePotionsImage from '../../assets/images/games/shelve-the-potions.card.jpg';

const games: Game[] = [
  { title: 'Tailside Cozy Cafe Sim', rating: 4.6, likes: '19.8K', image: tailsideImage, size: 'outer' },
  { title: 'ISLANDERS: New Shores', rating: 4.9, likes: '54.2K', image: islandersImage, size: 'side' },
  { title: 'Vacation Cafe Simulator', rating: 4.8, likes: '28.7K', image: vacationCafeImage, size: 'main' },
  { title: 'Winter Burrow', rating: 4.9, likes: '32.4K', image: winterBurrowImage, size: 'side' },
  { title: 'Shelve the Potions', rating: 4.5, likes: '12.1K', image: shelvePotionsImage, size: 'outer' },
];

export function createNewGames(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games';
  section.setAttribute('aria-labelledby', 'new-games-title');
  section.innerHTML = `
    <div class="new-games__header">
      <div class="new-games__heading">
        <span class="new-games__marker" aria-hidden="true"></span>
        <h2 class="new-games__title" id="new-games-title">New Games</h2>
      </div>
      <div class="new-games__controls">
        <button class="new-games__arrow" type="button" aria-label="Previous games">
          <img class="new-games__arrow-icon" src="${arrowLeftIcon}" alt="" />
        </button>
        <button class="new-games__arrow new-games__arrow--accent" type="button" aria-label="Next games">
          <img class="new-games__arrow-icon" src="${arrowRightIcon}" alt="" />
        </button>
      </div>
    </div>
    <ul class="new-games__track"></ul>
  `;

  const track = section.querySelector('.new-games__track');
  for (const game of games) {
    track?.append(createGameCard(game));
  }

  return section;
}