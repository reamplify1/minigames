import { describe, it, expect, vi } from 'vitest';

const { getLocationMock } = vi.hoisted(() => ({ getLocationMock: vi.fn() }));

vi.mock('../../app/router', () => ({ getLocation: getLocationMock }));

import { getCurrentPage } from './nav-items';

describe('getCurrentPage', () => {
  it('returns "library" when the current path is /library', () => {
    getLocationMock.mockReturnValue({ path: '/library' });

    expect(getCurrentPage()).toBe('library');
  });

  it('returns "home" for any other path', () => {
    getLocationMock.mockReturnValue({ path: '/' });

    expect(getCurrentPage()).toBe('home');
  });
});
