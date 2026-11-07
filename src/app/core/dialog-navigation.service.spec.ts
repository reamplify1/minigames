import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createFakeFirebase, provideTestApp, storeSession, settle } from '../testing/test-helpers';
import { DialogNavigationService, isAuthMode } from './dialog-navigation.service';
import { SnackbarService } from './snackbar.service';

describe('isAuthMode', () => {
  it('accepts only the two known modes', () => {
    expect(isAuthMode('login')).toBe(true);
    expect(isAuthMode('register')).toBe(true);
    expect(isAuthMode('admin')).toBe(false);
    expect(isAuthMode(null)).toBe(false);
  });
});

describe('DialogNavigationService', () => {
  let router: Router;
  let dialogs: DialogNavigationService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: provideTestApp(createFakeFirebase()) });
    router = TestBed.inject(Router);
    dialogs = TestBed.inject(DialogNavigationService);
    await router.navigateByUrl('/?sort=name-asc');
  });

  it('adds the game to the URL and keeps other parameters', async () => {
    dialogs.openGame('palia');
    await settle();
    expect(router.url).toBe('/?sort=name-asc&game=palia');
  });

  it('removes only the game parameter on close', async () => {
    await router.navigateByUrl('/?sort=name-asc&game=palia');
    dialogs.closeGame();
    await settle();
    expect(router.url).toBe('/?sort=name-asc');
  });

  it('opens login for a guest, keeps the game and skips the action', async () => {
    await router.navigateByUrl('/?game=palia');
    const action = vi.fn();

    dialogs.runProtected(action, 'Log in first.');
    await settle();

    expect(action).not.toHaveBeenCalled();
    expect(router.url).toBe('/?game=palia&auth=login');
    expect(TestBed.inject(SnackbarService).messages()[0]?.text).toBe('Log in first.');
  });

  it('runs the action for a logged-in user', () => {
    storeSession();
    const action = vi.fn();

    dialogs.runProtected(action);

    expect(action).toHaveBeenCalledOnce();
  });
});
