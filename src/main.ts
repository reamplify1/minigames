import './styles.scss';
import { initRouter, registerRoute } from './app/router';
import { renderHomePage } from './pages/home/home-page';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

registerRoute('/', renderHomePage);

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});
