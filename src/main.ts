import './styles.scss';
import { initRouter, registerRoute } from './app/router';
import { renderHomePage } from './pages/home/home-page';
import { renderLibraryPage } from './pages/library/library-page';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

registerRoute('/', renderHomePage);
registerRoute('/library', renderLibraryPage);

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});
