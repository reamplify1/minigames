export const SESSION_KEY = 'minigames:minigames-rss:app-session';

// app session lives for 5 minutes,
// independent of Firebase's own token lifetime.
const SESSION_DURATION_MS = 5 * 60 * 1000;

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

export type StoredSessionStatus = 'valid' | 'expired' | 'invalid' | 'none';

export interface StoredSessionResult {
  status: StoredSessionStatus;
  session?: AppSession;
}

function isAppSession(value: unknown): value is AppSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.displayName === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.authenticatedAt === 'number'
  );
}

function hasSessionExpired(session: AppSession): boolean {
  return Date.now() - session.authenticatedAt > SESSION_DURATION_MS;
}

export function saveSession(session: AppSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function readStoredSession(): StoredSessionResult {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return { status: 'none' };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'invalid' };
  }

  return isAppSession(parsed)
    ? { status: hasSessionExpired(parsed) ? 'expired' : 'valid', session: parsed }
    : { status: 'invalid' };
}
