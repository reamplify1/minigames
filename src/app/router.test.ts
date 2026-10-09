import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./auth-state', () => ({ checkSessionExpiration: vi.fn() }));

describe('router', () => {
  beforeEach(() => {
    vi.resetModules();
    history.replaceState({}, '', '/');
  });

  it('enters a newly matched route and updates it instead on a repeat visit', async () => {
    const { registerRoute, navigate } = await import('./router');
    const onEnter = vi.fn();
    const onUpdate = vi.fn();
    registerRoute('/library', { onEnter, onUpdate });

    navigate('/library');
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();

    navigate('/library?sort=new');
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('falls back to the not-found route for an unregistered path', async () => {
    const { registerRoute, navigate, getLocation, NOT_FOUND_ROUTE } = await import('./router');
    const onEnter = vi.fn();
    registerRoute(NOT_FOUND_ROUTE, { onEnter });

    navigate('/does-not-exist');

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(getLocation().path).toBe(NOT_FOUND_ROUTE);
  });

  it('treats "/home" the same as "/"', async () => {
    const { registerRoute, navigate, getLocation } = await import('./router');
    registerRoute('/', { onEnter: vi.fn() });

    navigate('/home');

    expect(getLocation().path).toBe('/');
  });

  it('does not push a new history entry when already on the requested location', async () => {
    const { registerRoute, navigate } = await import('./router');
    registerRoute('/library', { onEnter: vi.fn() });

    navigate('/library');
    const lengthAfterFirstNavigate = history.length;

    navigate('/library');

    expect(history.length).toBe(lengthAfterFirstNavigate);
  });

  it('replaces the current history entry instead of pushing when asked to', async () => {
    const { registerRoute, navigate } = await import('./router');
    registerRoute('/library', { onEnter: vi.fn() });
    const replaceSpy = vi.spyOn(history, 'replaceState');
    const pushSpy = vi.spyOn(history, 'pushState');

    navigate('/library', { replace: true });

    expect(replaceSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('notifies location listeners with the resolved route on every navigation', async () => {
    const { registerRoute, onLocationChange, navigate } = await import('./router');
    registerRoute('/library', { onEnter: vi.fn() });
    const listener = vi.fn();
    onLocationChange(listener);

    navigate('/library');

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ path: '/library' }));
  });

  it('carries the query string and hash over when navigating', async () => {
    const { registerRoute, navigate, getLocation } = await import('./router');
    registerRoute('/library', { onEnter: vi.fn() });

    navigate('/library?sort=new#top');

    expect(getLocation().searchParams.get('sort')).toBe('new');
    expect(globalThis.location.hash).toBe('#top');
  });
});
