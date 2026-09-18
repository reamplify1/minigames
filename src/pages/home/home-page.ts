import { createHeader } from '../../components/header/header';

export function renderHomePage(): void {
  const root = document.createElement('div');
  root.id = 'app';
  root.append(createHeader());

  document.body.replaceChildren(root);
}