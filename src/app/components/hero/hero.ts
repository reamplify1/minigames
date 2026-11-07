import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__card">
        <h1 class="hero__title" id="hero-title">Take a Short Break &amp; Have Fun</h1>
        <p class="hero__text">
          <span class="hero__text-full">
            Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle,
            match 3, farm, and board classics.
          </span>
          <span class="hero__text-short">
            Discover hundreds of curated casual mini-games right in your browser.
          </span>
        </p>
        <button class="hero__button" type="button">Browse Library</button>
      </div>
    </section>
  `,
  styleUrl: './hero.scss',
})
export class Hero {}
