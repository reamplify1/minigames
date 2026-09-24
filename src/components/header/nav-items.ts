export interface NavItem {
  label: string;
  href: string;
  page: 'home' | 'library' | undefined;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/', page: 'home' },
  { label: 'Library', href: '/library', page: 'library' },
  { label: 'Tournaments', href: '/', page: undefined },
  { label: 'Community', href: '/', page: undefined },
];

export function getCurrentPage(): NavItem['page'] {
  return globalThis.location.pathname === '/library' ? 'library' : 'home';
}