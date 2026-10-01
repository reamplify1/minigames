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
  url.searchParams.delete('game');
  return `${url.pathname}${url.search}`;
}

export function withoutAuthParameter(): string {
  const url = currentUrl();
  url.searchParams.delete('auth');
  return `${url.pathname}${url.search}`;
}
