import type { IsActiveMatchOptions } from '@angular/router';

export interface NavItem {
  label: string;
  href: string;
  hasPage: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', hasPage: true },
  { label: 'Library', href: '/library', hasPage: true },
  { label: 'Tournaments', href: '/', hasPage: false },
  { label: 'Community', href: '/', hasPage: false },
];

export const NAV_LINK_MATCH: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};
