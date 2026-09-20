type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};

export function registerRoute(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigateTo(path: string): void {
  globalThis.history.pushState({}, '', path);
  render();
}

function render(): void {
  const path = globalThis.location.pathname;
  const handler = routes[path] ?? routes['/'];
  handler();
}

export function initRouter(): void {
  globalThis.addEventListener('popstate', render);
  render();
}
