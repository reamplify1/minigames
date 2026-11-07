import { Component, inject, linkedSignal } from '@angular/core';
import { type IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DialogNavigationService } from '../../core/dialog-navigation.service';
import type { AppSession } from '../../core/session';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { NAV_ITEMS, NAV_LINK_MATCH, type NavItem } from './nav-items';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MobileMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth: AuthService = inject(AuthService);
  protected readonly dialogs: DialogNavigationService = inject(DialogNavigationService);

  protected readonly navItems: NavItem[] = NAV_ITEMS;
  protected readonly navLinkMatch: IsActiveMatchOptions = NAV_LINK_MATCH;

  protected readonly avatarFailed = linkedSignal<AppSession | undefined, boolean>({
    source: this.auth.session,
    computation: (): boolean => false,
  });
}
