import { Component } from '@angular/core';

@Component({
  selector: 'app-developer-cta',
  template: `
    <section class="developer-cta" aria-labelledby="developer-cta-title">
      <img
        class="developer-cta__illustration"
        src="assets/images/illustration-side.png"
        alt=""
        loading="lazy"
      />
      <div class="developer-cta__card">
        <h2 class="developer-cta__title" id="developer-cta-title">Are You a Game Developer?</h2>
        <p class="developer-cta__text">{{ description }}</p>
        <button class="developer-cta__button" type="button">
          <img class="developer-cta__button-icon" src="assets/icons/upload-icon.svg" alt="" />
          Submit Form
        </button>
        <address class="developer-cta__contact">
          or contact us at developers&#64;minigames.com
        </address>
      </div>
    </section>
  `,
  styleUrl: './developer-cta.scss',
})
export class DeveloperCta {
  protected readonly description: string = [
    "Want to see your game on MiniGames? We're always looking for fun,",
    'engaging mini games to add to our platform. Submit your game',
    'and reach thousands of players!',
  ].join('\n');
}
