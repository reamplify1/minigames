import { describe, it, expect, vi } from 'vitest';

vi.mock('../../firebase/firebase-config', () => ({ firebaseAuth: {} }));

import { isAuthMode } from './auth-dialog';

describe('isAuthMode', () => {
  it('accepts "login" and "register"', () => {
    expect(isAuthMode('login')).toBe(true);
    expect(isAuthMode('register')).toBe(true);
  });

  it('rejects anything else, including missing values', () => {
    expect(isAuthMode('guest')).toBe(false);
    expect(isAuthMode('')).toBe(false);
    expect(isAuthMode(undefined)).toBe(false);
    expect(isAuthMode(undefined)).toBe(false);
  });
});
