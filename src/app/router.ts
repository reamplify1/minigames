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

const routes = new Map<string, RouteDefinition>();
const locationListeners: LocationListener[] = [];
const routerState = { currentRouteKey: undefined as string | undefined };

function normalizePath(pathname: string): string {
  return pathname === '/home' ? '/' : pathname;
}

function resolveRouteKey(pathname: string): string {
  const normalized = normalizePath(pathname);
  return routes.has(normalized) ? normalized : '/';
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
