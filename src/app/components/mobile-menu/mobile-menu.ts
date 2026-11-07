import {
  afterRenderEffect,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { type IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DialogNavigationService, type AuthMode } from '../../core/dialog-navigation.service';
import type { AppSession } from '../../core/session';
import { NAV_ITEMS, NAV_LINK_MATCH, type NavItem } from '../header/nav-items';

const NO_SCROLL_CLASS: string = 'no-scroll';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  host: {
    '(document:keydown.escape)': 'closeIfOpen()',
    '(window:resize)': 'closeIfUnavailable()',
  },
})
export class MobileMenu {
  readonly trigger = input.required<HTMLElement>();

  protected readonly auth: AuthService = inject(AuthService);
  private readonly dialogs: DialogNavigationService = inject(DialogNavigationService);

  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');
  private readonly closeButton = viewChild.required<ElementRef<HTMLElement>>('closeButton');

  readonly isOpen = signal<boolean>(false);

  protected readonly navItems: NavItem[] = NAV_ITEMS;
  protected readonly navLinkMatch: IsActiveMatchOptions = NAV_LINK_MATCH;

  protected readonly avatarFailed = linkedSignal<AppSession | undefined, boolean>({
    source: this.auth.session,
    computation: (): boolean => false,
  });

  constructor() {
    effect((): void => {
      document.body.classList.toggle(NO_SCROLL_CLASS, this.isOpen());
    });

    afterRenderEffect((): void => {
      if (this.isOpen()) {
        this.closeButton().nativeElement.focus();
      }
    });
  }

  open(): void {
    if (this.isAvailable()) {
      this.isOpen.set(true);
    }
  }

  protected close(): void {
    this.isOpen.set(false);
    this.trigger().focus();
  }

  protected closeIfOpen(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  protected closeIfUnavailable(): void {
    if (this.isOpen() && !this.isAvailable()) {
      this.close();
    }
  }

  protected openAuth(mode: AuthMode): void {
    this.close();
    void this.dialogs.openAuth(mode);
  }

  protected logout(): void {
    this.close();
    void this.auth.logout();
  }

  private isAvailable(): boolean {
    return getComputedStyle(this.menu().nativeElement).display !== 'none';
  }
}
