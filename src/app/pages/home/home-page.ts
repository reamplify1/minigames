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
      <app-leaderboard />
      <app-developer-cta />
    </main>
  `,
})
export class HomePage {}
