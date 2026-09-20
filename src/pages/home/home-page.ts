import { createHeader } from '../../components/header/header';
import { createHero } from '../../components/hero/hero';
import { createNewGames } from '../../components/new-games/new-games';
import { createLeaderboard } from '../../components/leaderboard/leaderboard';
import { createDeveloperCta } from '../../components/developer-cta/developer-cta';
import { createFooter } from '../../components/footer/footer';
import { createAuthDialog } from '../../components/auth-dialog/auth-dialog';

export function renderHomePage(): void {
  const root = document.createElement('div');
  root.id = 'app';

  const main = document.createElement('main');
  main.append(createHero(), createNewGames(), createLeaderboard(), createDeveloperCta());

  root.append(createHeader(), main, createFooter(), createAuthDialog());

  document.body.replaceChildren(root);

  document.querySelector<HTMLDialogElement>('.auth-dialog')?.showModal();
}