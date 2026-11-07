import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { skipTransitionOnSamePage } from './core/page-transition';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions({ onViewTransitionCreated: skipTransitionOnSamePage })
    ),
    provideHttpClient(),
  ],
};
