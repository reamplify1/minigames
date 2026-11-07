import { Component } from '@angular/core';
import { DeveloperCta } from '../../components/developer-cta/developer-cta';
import { Hero } from '../../components/hero/hero';
import { Leaderboard } from '../../components/leaderboard/leaderboard';
import { NewGames } from '../../components/new-games/new-games';

@Component({
  selector: 'app-home-page',
  imports: [Hero, NewGames, Leaderboard, DeveloperCta],
  template: `
    <main>
      <app-hero />
      <app-new-games />
      @defer (on viewport) {
        <app-leaderboard />
      } @placeholder {
        <div class="home-page__placeholder home-page__placeholder--leaderboard"></div>
      }
      @defer (on viewport) {
        <app-developer-cta />
      } @placeholder {
        <div class="home-page__placeholder home-page__placeholder--developer-cta"></div>
      }
    </main>
  `,
  styleUrl: './home-page.scss',
})
export class HomePage {}
