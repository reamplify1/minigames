import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  createFakeFirebase,
  provideTestApp,
  storeSession,
  type FakeFirebase,
  settle,
} from '../../testing/test-helpers';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let firebase: FakeFirebase;

  async function setup(): Promise<void> {
    firebase = createFakeFirebase();
    TestBed.configureTestingModule({
      providers: provideTestApp(firebase, [
        { path: '', children: [] },
        { path: 'library', children: [] },
      ]),
    });
    fixture = TestBed.createComponent(Header);
    await settle();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Log In and Sign Up to a guest', async () => {
    await setup();

    const labels = [...element().querySelectorAll('.header__btn')].map((button) =>
      button.textContent?.trim()
    );

    expect(labels).toEqual(['Log In', 'Sign Up']);
  });

  it('opens the register dialog through the URL', async () => {
    await setup();

    element().querySelector<HTMLElement>('.header__btn--accent')?.click();
    await settle();

    expect(TestBed.inject(Router).url).toBe('/?auth=register');
  });

  it('shows the profile to a logged-in user', async () => {
    storeSession();
    await setup();

    expect(element().querySelector('.header__user')?.textContent).toBe('Forest Dweller');
    expect(element().querySelector('.header__avatar-initials')?.textContent).toBe('FD');
  });

  it('falls back to initials when the avatar image fails', async () => {
    storeSession({ avatarUrl: 'https://example.com/broken.png' });
    await setup();

    element().querySelector('.header__avatar-img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(element().querySelector('.header__avatar-img')).toBeNull();
    expect(element().querySelector('.header__avatar-initials')?.textContent).toBe('FD');
  });

  it('updates right after logout', async () => {
    storeSession();
    await setup();

    await TestBed.inject(AuthService).logout();
    await settle();

    expect(element().querySelector('.header__user')).toBeNull();
  });

  it('highlights the current page, whatever the query says', async () => {
    await setup();

    await TestBed.inject(Router).navigateByUrl('/library?page=2&game=palia');
    await settle();

    const active = element().querySelector('.header__nav-link--active');

    expect(active?.textContent?.trim()).toBe('Library');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('never highlights links without a page', async () => {
    await setup();

    await TestBed.inject(Router).navigateByUrl('/');
    await settle();

    expect(element().querySelectorAll('.header__nav-link--active')).toHaveLength(1);
  });
});
