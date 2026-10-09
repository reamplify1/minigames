import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  clearSession,
  readStoredSession,
  SESSION_KEY,
  type AppSession,
} from './session';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function buildSession(authenticatedAt: number): AppSession {
  return {
    displayName: 'ForestDweller',
    email: 'student@rs.school',
    authenticatedAt,
  };
}

describe('readStoredSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports "none" when nothing is stored', () => {
    expect(readStoredSession()).toEqual({ status: 'none' });
  });

  it('reports "invalid" when the stored value is not valid JSON', () => {
    localStorage.setItem(SESSION_KEY, 'not-json');

    expect(readStoredSession()).toEqual({ status: 'invalid' });
  });

  it('reports "invalid" when the stored object is missing required fields', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'student@rs.school' }));

    expect(readStoredSession()).toEqual({ status: 'invalid' });
  });

  it('reports "valid" for a session within its 5-minute lifetime', () => {
    const session = buildSession(Date.now() - 1000);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    expect(readStoredSession()).toEqual({ status: 'valid', session });
  });

  it('reports "expired" once the session is older than 5 minutes', () => {
    const session = buildSession(Date.now() - (FIVE_MINUTES_MS + 1000));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    expect(readStoredSession()).toEqual({ status: 'expired', session });
  });
});

describe('saveSession / clearSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists the session so it can be read back', () => {
    const session = buildSession(Date.now());
    saveSession(session);

    expect(readStoredSession()).toEqual({ status: 'valid', session });
  });

  it('removes the stored session', () => {
    saveSession(buildSession(Date.now()));
    clearSession();

    expect(readStoredSession()).toEqual({ status: 'none' });
  });
});
