import './game-cards-section.scss';
import { fetchLibraryGames, type Game, type GameFilters, type GamesMeta } from './games.data';
import { navigate } from '../../app/router';
import { withGameParameter } from '../../app/dialog-urls';
import {
  createSkeletonList,
  createErrorBanner,
  createEmptyState,
} from './game-cards-section.states';
import { showSnackbar } from '../snackbar/snackbar';
import starIcon from '../../assets/icons/star-icon.svg';
import heartIcon from '../../assets/icons/favorite-icon.svg';

const FREE_PRICE = 'Free';
const SKELETON_COUNT = 6;

function createStat(icon: string, label: string, value: string): HTMLElement {
  const stat = document.createElement('span');
  stat.className = 'library-card__stat';

  const image = document.createElement('img');
  image.className = 'library-card__stat-icon';
  image.src = icon;
  image.alt = label;

  const text = document.createElement('span');
  text.textContent = value;

  stat.append(image, text);
  return stat;
}

function createGameCard(game: Game): HTMLElement {
  const card = document.createElement('article');
  card.className = 'library-card';

  const cover = document.createElement('img');
  cover.className = 'library-card__cover';
  cover.src = game.cover;
  cover.alt = `${game.title} cover`;
  cover.loading = 'lazy';

  const content = document.createElement('div');
  content.className = 'library-card__content';

  const info = document.createElement('div');
  info.className = 'library-card__info';

  const title = document.createElement('h2');
  title.className = 'library-card__title';
  title.textContent = game.title;

  const genre = document.createElement('span');
  genre.className = 'library-card__genre';
  genre.textContent = game.genre;

  info.append(title, genre);

  const price = document.createElement('span');
  price.className = 'library-card__price';
  if (game.price === FREE_PRICE) price.classList.add('library-card__price--free');
  price.textContent = game.price;

  const description = document.createElement('p');
  description.className = 'library-card__description';
  description.textContent = game.description;

  const stats = document.createElement('div');
  stats.className = 'library-card__stats';
  stats.append(
    createStat(starIcon, 'Rating', String(game.rating)),
    createStat(heartIcon, 'Likes', game.likes)
  );

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'library-card__details';
  detailsButton.textContent = 'Details';
  detailsButton.addEventListener('click', () => navigate(withGameParameter(game.id)));

  content.append(info, price, description, stats, detailsButton);
  card.append(cover, content);

  return card;
}

function createGameList(games: Game[]): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'library-games__list';
  list.setAttribute('role', 'list');

  for (const game of games) {
    const item = document.createElement('li');
    item.append(createGameCard(game));
    list.append(item);
  }

  return list;
}

export interface GameCardsSectionOptions {
  onMetaChange?: (meta: GamesMeta) => void;
}

export interface GameCardsSection {
  element: HTMLElement;
  setFilters: (filters: GameFilters) => void;
}

export function createGameCardsSection(options: GameCardsSectionOptions = {}): GameCardsSection {
  const section = document.createElement('section');
  section.className = 'library-games';
  section.setAttribute('aria-label', 'Games');

  let requestId = 0;

  const load = async (filters: GameFilters): Promise<void> => {
    const currentRequestId = ++requestId;

    section.innerHTML = `
      <ul class="library-games__list">${createSkeletonList(SKELETON_COUNT)}</ul>
    `;

    try {
      const { games, meta } = await fetchLibraryGames(filters);
      if (currentRequestId !== requestId) return;

      options.onMetaChange?.(meta);

      if (games.length === 0) {
        section.querySelector('.library-games__list')?.replaceWith(createEmptyState());
        return;
      }

      section.replaceChildren(createGameList(games));
    } catch {
      if (currentRequestId !== requestId) return;
      section
        .querySelector('.library-games__list')
        ?.replaceWith(createErrorBanner(() => load(filters)));
      showSnackbar('Could not load games.', 'error');
    }
  };

  return {
    element: section,
    setFilters: (filters) => void load(filters),
  };
}
