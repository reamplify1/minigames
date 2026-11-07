import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createFakeFirebase, provideTestApp, settle } from '../../testing/test-helpers';
import { Header } from '../header/header';

describe('MobileMenu', () => {
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    localStorage.clear();
    document.body.className = '';
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    fixture = TestBed.createComponent(Header);
    document.body.append(fixture.nativeElement as HTMLElement);
    await settle();
  });

  afterEach(() => {
    (fixture.nativeElement as HTMLElement).remove();
  });

  function query(selector: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(selector) as HTMLElement;
  }

  async function openMenu(): Promise<void> {
    query('.mobile-menu').style.display = 'block';
    query('.header__burger').click();
    await settle();
  }

  it('opens, stops page scroll and moves focus to the close button', async () => {
    await openMenu();

    expect(query('.mobile-menu').classList.contains('mobile-menu--open')).toBe(true);
    expect(document.body.classList.contains('no-scroll')).toBe(true);
    expect(query('.header__burger').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(query('.mobile-menu__close'));
  });

  it('closes on Escape and returns focus to the burger', async () => {
    await openMenu();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();

    expect(query('.mobile-menu').classList.contains('mobile-menu--open')).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
    expect(document.activeElement).toBe(query('.header__burger'));
  });

  it('closes when the screen becomes too wide for the menu', async () => {
    await openMenu();
    query('.mobile-menu').style.display = 'none';

    globalThis.dispatchEvent(new Event('resize'));
    await settle();

    expect(query('.mobile-menu').classList.contains('mobile-menu--open')).toBe(false);
  });

  it('closes and opens the login dialog', async () => {
    await openMenu();

    query('.mobile-menu__btn--outline').click();
    await settle();

    expect(query('.mobile-menu').classList.contains('mobile-menu--open')).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/?auth=login');
  });
});
