export interface RouteContext {
  path: string;
  searchParams: URLSearchParams;
}

export interface RouteDefinition {
  onEnter: (context: RouteContext) => void;
  onUpdate?: (context: RouteContext) => void;
}

interface NavigateOptions {
  replace?: boolean;
}

type LocationListener = (context: RouteContext) => void;

export const NOT_FOUND_ROUTE = '*';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

const routes = new Map<string, RouteDefinition>();
const locationListeners: LocationListener[] = [];
const routerState = { currentRouteKey: undefined as string | undefined };

function stripBasePath(pathname: string): string {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    const rest = pathname.slice(BASE_PATH.length);
    return rest === '' ? '/' : rest;
  }

  return pathname;
}

function normalizePath(pathname: string): string {
  const withoutBase = stripBasePath(pathname);
  return withoutBase === '/home' ? '/' : withoutBase;
}

function resolveRouteKey(pathname: string): string {
  const normalized = normalizePath(pathname);
  return routes.has(normalized) ? normalized : NOT_FOUND_ROUTE;
}

function getContext(): RouteContext {
  return {
    path: resolveRouteKey(globalThis.location.pathname),
    searchParams: new URLSearchParams(globalThis.location.search),
  };
}

export function registerRoute(path: string, definition: RouteDefinition): void {
  routes.set(path, definition);
}

export function onLocationChange(listener: LocationListener): void {
  locationListeners.push(listener);
}

function render(context: RouteContext, { forceEnter = false } = {}): void {
  const routeKey = resolveRouteKey(context.path);
  const definition = routes.get(routeKey);

  if (!definition) {
    return;
  }

  if (forceEnter || routeKey !== routerState.currentRouteKey) {
    routerState.currentRouteKey = routeKey;
    definition.onEnter(context);
  } else {
    definition.onUpdate?.(context);
  }

  for (const listener of locationListeners) {
    listener(context);
  }
}

export function navigate(url: string, { replace = false }: NavigateOptions = {}): void {
  const target = new URL(url, globalThis.location.origin);
  const isSameLocation =
    target.pathname + target.search === globalThis.location.pathname + globalThis.location.search;

  if (isSameLocation) {
    return;
  }

  if (replace) {
    globalThis.history.replaceState(undefined, '', target);
  } else {
    globalThis.history.pushState(undefined, '', target);
  }

  render(getContext());
}

export function getLocation(): RouteContext {
  return getContext();
}

export function initRouter(): void {
  globalThis.addEventListener('popstate', () => {
    render(getContext());
  });

  render(getContext(), { forceEnter: true });
}
