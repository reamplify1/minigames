import { describe, it, expect } from 'vitest';
import {
  withGameParameter,
  withoutGameParameter,
  withAuthParameter,
  withoutAuthParameter,
} from './dialog-urls';

describe('withGameParameter', () => {
  it('sets the game param and drops any auth param, keeping other params', () => {
    history.pushState({}, '', '/library?auth=login&sort=new');

    expect(withGameParameter('demo-slug')).toBe('/library?sort=new&game=demo-slug');
  });
});

describe('withoutGameParameter', () => {
  it('removes only the game param', () => {
    history.pushState({}, '', '/library?game=demo-slug&sort=new');

    expect(withoutGameParameter()).toBe('/library?sort=new');
  });

  it('preserves the hash', () => {
    history.pushState({}, '', '/library?game=demo-slug#section');

    expect(withoutGameParameter()).toBe('/library#section');
  });
});

describe('withAuthParameter', () => {
  it('sets the auth param while keeping an existing game param', () => {
    history.pushState({}, '', '/library?game=demo-slug');

    expect(withAuthParameter('login')).toBe('/library?game=demo-slug&auth=login');
  });
});

describe('withoutAuthParameter', () => {
  it('removes only the auth param', () => {
    history.pushState({}, '', '/library?auth=login&game=demo-slug');

    expect(withoutAuthParameter()).toBe('/library?game=demo-slug');
  });
});
