import './not-found-page.scss';
import { createHeader } from '../../components/header/header';
import { createFooter } from '../../components/footer/footer';
import { navigate } from '../../app/router';

const HOME_PATH = '/';

export function renderNotFoundPage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.className = 'not-found-page';

  const code = document.createElement('p');
  code.className = 'not-found-page__code';
  code.textContent = '404';

  const title = document.createElement('h1');
  title.className = 'not-found-page__title';
  title.textContent = 'Page Not Found';

  const message = document.createElement('p');
  message.className = 'not-found-page__message';
  message.textContent = "The page you're looking for doesn't exist or has been moved.";

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.className = 'not-found-page__home-button';
  homeButton.textContent = 'Return to Home Page';
  homeButton.addEventListener('click', () => navigate(HOME_PATH));

  main.append(code, title, message, homeButton);
  root.append(createHeader(), main, createFooter());

  document.body.replaceChildren(root);
}
