import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkStatusService } from '../../core/network-status.service';
import { settle } from '../../testing/test-helpers';
import { OfflineBanner } from './offline-banner';

describe('OfflineBanner', () => {
  let fixture: ComponentFixture<OfflineBanner>;
  let network: NetworkStatusService;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OfflineBanner);
    network = TestBed.inject(NetworkStatusService);
    network.markOnline();
    await settle();
  });

  function banner(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.offline-banner');
  }

  it('is hidden while the app is online', () => {
    expect(banner()).toBeNull();
  });

  it('appears when the browser goes offline and hides when it is back', async () => {
    globalThis.dispatchEvent(new Event('offline'));
    await settle();
    expect(banner()?.textContent).toContain("You're offline");

    globalThis.dispatchEvent(new Event('online'));
    await settle();
    expect(banner()).toBeNull();
  });

  it('appears when a request fails because of the network', async () => {
    network.markOffline();
    await settle();

    expect(banner()?.getAttribute('role')).toBe('status');
  });
});
