import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page';
import { LibraryPage } from './pages/library/library-page';
import { NotFoundPage } from './pages/not-found/not-found-page';

export const routes: Routes = [
  { path: '', component: HomePage, pathMatch: 'full' },
  { path: 'home', redirectTo: '' },
  { path: 'library', component: LibraryPage },
  { path: '**', component: NotFoundPage },
];
