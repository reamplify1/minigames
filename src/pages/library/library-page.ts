import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';

export function renderLibraryPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'library-page';
  main.innerHTML = `
    <h1 class="library-page__title">Library</h1>
  `;

  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}