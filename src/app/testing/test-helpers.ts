import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, type Routes } from '@angular/router';
import type { Mock } from 'vitest';
import { FirebaseAuthService } from '../core/firebase-auth.service';
import { SESSION_KEY, type AppSession } from '../core/session';

export interface FakeFirebase {
  login: Mock;
  register: Mock;
  loginWithGoogle: Mock;
  logout: Mock;
}

export function createFakeFirebase(): FakeFirebase {
  return {
    login: vi.fn().mockResolvedValue({ displayName: 'Forest', email: 'forest@test.dev' }),
    register: vi.fn().mockResolvedValue({ displayName: null, email: 'forest@test.dev' }),
    loginWithGoogle: vi.fn().mockResolvedValue({
      displayName: 'Forest',
      email: 'forest@test.dev',
      photoURL: 'https://example.com/avatar.png',
    }),
    logout: vi.fn().mockResolvedValue(undefined),
  };
}

export function provideTestApp(
  firebase: FakeFirebase,
  routes: Routes = []
): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter(routes),
    { provide: FirebaseAuthService, useValue: firebase },
  ];
}

export function storeSession(overrides: Partial<AppSession> = {}): void {
  const session: AppSession = {
    displayName: 'Forest Dweller',
    email: 'forest@test.dev',
    authenticatedAt: Date.now(),
    ...overrides,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function settle(): Promise<void> {
  await waitForNextTask();
  TestBed.tick();
  await waitForNextTask();
}

function waitForNextTask(): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve);
  });
}
