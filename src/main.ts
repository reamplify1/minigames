import { initRouter, registerRoute } from './app/router';
import { renderHomePage } from './pages/home/home-page';

registerRoute('/', renderHomePage);

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});