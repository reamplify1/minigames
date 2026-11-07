import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'MiniGames',
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  { path: 'home', redirectTo: '' },
  {
    path: 'library',
    title: 'Game Library — MiniGames',
    loadComponent: () => import('./pages/library/library-page').then((m) => m.LibraryPage),
  },
  {
    path: '**',
    title: 'Page Not Found — MiniGames',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
