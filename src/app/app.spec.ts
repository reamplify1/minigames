import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';
import { SnackbarService } from './core/snackbar.service';
import { createFakeFirebase, provideTestApp, storeSession, settle } from './testing/test-helpers';

describe('App', () => {
  async function setup(url: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase(), routes) });

    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await settle();

    return fixture.nativeElement as HTMLElement;
  }

  function isOpen(element: HTMLElement, selector: string): boolean {
    return element.querySelector<HTMLDialogElement>(selector)?.open ?? false;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('opens the game dialog from the URL', async () => {
    const element = await setup('/?game=palia');
    expect(isOpen(element, '.game-details-dialog')).toBe(true);
  });

  it('opens the login dialog from the URL', async () => {
    const element = await setup('/library?auth=register');

    expect(isOpen(element, '.auth-dialog')).toBe(true);
    expect(element.querySelector<HTMLElement>('.auth-dialog')?.dataset['mode']).toBe('register');
  });

  it('ignores an unknown auth mode', async () => {
    const element = await setup('/?auth=admin');
    expect(isOpen(element, '.auth-dialog')).toBe(false);
  });

  it('shows only the login dialog when both are in the URL', async () => {
    const element = await setup('/?game=palia&auth=login');

    expect(isOpen(element, '.auth-dialog')).toBe(true);
    expect(isOpen(element, '.game-details-dialog')).toBe(false);
  });

  it('removes ?auth for a user who is already signed in', async () => {
    storeSession();
    await setup('/?auth=login');
    await settle();

    expect(TestBed.inject(Router).url).toBe('/');
    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toBe("You're already signed in.");
  });

  it('checks the session before every navigation', async () => {
    await setup('/');
    const check = vi.spyOn(TestBed.inject(AuthService), 'checkSessionExpiration');

    await TestBed.inject(Router).navigateByUrl('/library');

    expect(check).toHaveBeenCalled();
  });

  it('shows the 404 page for an unknown path and keeps the URL', async () => {
    const element = await setup('/no/such/page');

    expect(element.querySelector('.not-found-page__code')?.textContent).toBe('404');
    expect(TestBed.inject(Router).url).toBe('/no/such/page');
  });

  it('redirects /home to the home page', async () => {
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase(), routes) });

    await RouterTestingHarness.create('/home');

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('returns home from the 404 page', async () => {
    const element = await setup('/no/such/page');

    element.querySelector<HTMLElement>('.not-found-page__home-button')?.click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
