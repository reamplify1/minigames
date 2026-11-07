import type { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';

function getPagePath(route: ActivatedRouteSnapshot): string {
  let current: ActivatedRouteSnapshot = route;

  while (current.firstChild) {
    current = current.firstChild;
  }

  return current.pathFromRoot.map((part: ActivatedRouteSnapshot) => part.url.join('/')).join('/');
}

export function skipTransitionOnSamePage({ transition, from, to }: ViewTransitionInfo): void {
  if (getPagePath(from) === getPagePath(to)) {
    transition.skipTransition();
  }
}
