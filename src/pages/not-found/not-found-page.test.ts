import { describe, it, expect, vi } from 'vitest';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('../../app/router', () => ({ navigate: navigateMock }));
vi.mock('../../components/header/header', () => ({
  createHeader: () => document.createElement('header'),
}));
vi.mock('../../components/footer/footer', () => ({
  createFooter: () => document.createElement('footer'),
}));

import { renderNotFoundPage } from './not-found-page';

describe('renderNotFoundPage', () => {
  it('renders the 404 message into the page', () => {
    renderNotFoundPage();

    expect(document.querySelector('.not-found-page__code')?.textContent).toBe('404');
    expect(document.querySelector('.not-found-page__title')?.textContent).toBe('Page Not Found');
  });

  it('navigates to the home page when the button is clicked', () => {
    renderNotFoundPage();

    document.querySelector<HTMLButtonElement>('.not-found-page__home-button')?.click();

    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
