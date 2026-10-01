import './styles.scss';
import { initRouter, registerRoute, NOT_FOUND_ROUTE } from './app/router';
import { initDialogSync } from './app/dialog-sync';
import { renderHomePage } from './pages/home/home-page';
import { renderLibraryPage, updateLibraryPage } from './pages/library/library-page';
import { renderNotFoundPage } from './pages/not-found/not-found-page';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

registerRoute('/', { onEnter: () => renderHomePage() });
registerRoute('/library', { onEnter: renderLibraryPage, onUpdate: updateLibraryPage });
registerRoute(NOT_FOUND_ROUTE, { onEnter: () => renderNotFoundPage() });

document.addEventListener('DOMContentLoaded', () => {
  initDialogSync();
  initRouter();
});
