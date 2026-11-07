import { Component, inject } from '@angular/core';
import { NetworkStatusService } from '../../core/network-status.service';

@Component({
  selector: 'app-offline-banner',
  template: `
    @if (network.isOffline()) {
      <p class="offline-banner" role="status">
        You're offline. Some content may not load until the connection is back.
      </p>
    }
  `,
  styleUrl: './offline-banner.scss',
})
export class OfflineBanner {
  protected readonly network: NetworkStatusService = inject(NetworkStatusService);
}
