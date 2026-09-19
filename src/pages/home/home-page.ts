import { createHeader } from '../../components/header/header';
import { createHero } from '../../components/hero/hero';

export function renderHomePage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.append(createHero());

  root.append(createHeader(), main);

  document.body.replaceChildren(root);
}