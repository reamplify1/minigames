import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  readonly isOffline = signal<boolean>(!navigator.onLine);

  constructor() {
    globalThis.addEventListener('online', () => this.isOffline.set(false));
    globalThis.addEventListener('offline', () => this.isOffline.set(true));
  }

  markOnline(): void {
    this.isOffline.set(false);
  }

  markOffline(): void {
    this.isOffline.set(true);
  }
}
