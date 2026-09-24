type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};
const routerState = { currentPath: '/' };

export function registerRoute(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigateTo(path: string): void {
  routerState.currentPath = path;
  render();
}

export function getCurrentPath(): string {
  return routerState.currentPath;
}

function render(): void {
  const handler = routes[routerState.currentPath] ?? routes['/'];
  handler();
}

export function initRouter(): void {
  render();
}