import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="not-found-page">
      <p class="not-found-page__code">404</p>
      <h1 class="not-found-page__title">Page Not Found</h1>
      <p class="not-found-page__message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button class="not-found-page__home-button" type="button" routerLink="/">
        Return to Home Page
      </button>
    </main>
  `,
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {}
