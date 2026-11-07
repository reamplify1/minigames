import type { ActivatedRouteSnapshot, ViewTransitionInfo } from '@angular/router';
import { skipTransitionOnSamePage } from './page-transition';

function snapshot(...segments: string[]): ActivatedRouteSnapshot {
  const page = { url: segments.map((path: string) => ({ path })), firstChild: null };
  const root = { url: [], firstChild: page };
  const withPath = (node: object, pathFromRoot: object[]): object =>
    Object.assign(node, { pathFromRoot });

  withPath(root, [root]);
  withPath(page, [root, page]);

  return root as unknown as ActivatedRouteSnapshot;
}

function info(from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot): ViewTransitionInfo {
  return {
    transition: { skipTransition: vi.fn() },
    from,
    to,
  } as unknown as ViewTransitionInfo;
}

describe('skipTransitionOnSamePage', () => {
  it('animates a move to another page', () => {
    const transition = info(snapshot(), snapshot('library'));

    skipTransitionOnSamePage(transition);

    expect(transition.transition.skipTransition).not.toHaveBeenCalled();
  });

  it('skips the animation when only the query changes', () => {
    const transition = info(snapshot('library'), snapshot('library'));

    skipTransitionOnSamePage(transition);

    expect(transition.transition.skipTransition).toHaveBeenCalledOnce();
  });
});
