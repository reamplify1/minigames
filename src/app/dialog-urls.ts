function currentUrl(): URL {
  return new URL(globalThis.location.href);
}

export function withGameParameter(slug: string): string {
  const url = currentUrl();
  url.searchParams.set('game', slug);
  url.searchParams.delete('auth');
  return `${url.pathname}${url.search}`;
}

export function withoutGameParameter(): string {
  const url = currentUrl();
  url.searchParams.delete('game');
  return `${url.pathname}${url.search}`;
}

export function withAuthParameter(mode: string): string {
  const url = currentUrl();
  url.searchParams.set('auth', mode);
  // Deliberately keeps any existing "game" parameter: when a protected
  // action opens Auth from inside Game Details (RSS-QS-4-3-2), the game's
  // URL state must survive so it can be restored once Auth closes.
  return `${url.pathname}${url.search}`;
}

export function withoutAuthParameter(): string {
  const url = currentUrl();
  url.searchParams.delete('auth');
  return `${url.pathname}${url.search}`;
}
