import { createHeader } from '../../components/header/header';
import { createHero } from '../../components/hero/hero';
import { createNewGames } from '../../components/new-games/new-games';

export function renderHomePage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.append(createHero(), createNewGames());
  root.append(createHeader(), main);

  document.body.replaceChildren(root);
}