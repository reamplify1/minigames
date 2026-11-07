import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api';
import { apiInterceptor, RETRY_DELAY_MS } from './api.interceptor';
import { NetworkStatusService } from './network-status.service';

const URL: string = apiUrl('/leaderboard');

describe('apiInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let network: NetworkStatusService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    network = TestBed.inject(NetworkStatusService);
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
  });

  function failWithNetworkError(): void {
    controller.expectOne(URL).error(new ProgressEvent('error'));
  }

  it('repeats a GET request after a network error and then succeeds', async () => {
    const response = firstValueFrom(http.get(URL));

    failWithNetworkError();
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    controller.expectOne(URL).flush({ data: [] });

    await expect(response).resolves.toEqual({ data: [] });
  });

  it('gives up after two retries and marks the app offline', async () => {
    const response = firstValueFrom(http.get(URL));
    const result = expect(response).rejects.toMatchObject({ status: 0 });

    failWithNetworkError();
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    failWithNetworkError();
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS * 2);
    failWithNetworkError();

    await result;
    expect(network.isOffline()).toBe(true);
  });

  it('repeats after a server error', async () => {
    const response = firstValueFrom(http.get(URL));

    controller.expectOne(URL).flush('', { status: 503, statusText: 'Unavailable' });
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    controller.expectOne(URL).flush({ data: [] });

    await expect(response).resolves.toEqual({ data: [] });
  });

  it('does not repeat a 404, because asking again will not help', async () => {
    const response = firstValueFrom(http.get(URL));
    const result = expect(response).rejects.toMatchObject({ status: 404 });

    controller.expectOne(URL).flush('', { status: 404, statusText: 'Not Found' });

    await result;
    expect(network.isOffline()).toBe(false);
  });

  it('never repeats a POST, so a comment is not sent twice', async () => {
    const response = firstValueFrom(http.post(apiUrl('/games/palia/comments'), {}));
    const result = expect(response).rejects.toMatchObject({ status: 0 });

    controller.expectOne(apiUrl('/games/palia/comments')).error(new ProgressEvent('error'));

    await result;
  });

  it('clears the offline state after a successful response', async () => {
    network.markOffline();
    const response = firstValueFrom(http.get(URL));

    controller.expectOne(URL).flush({ data: [] });
    await response;

    expect(network.isOffline()).toBe(false);
  });

  it('leaves requests to other sites alone', async () => {
    const response = firstValueFrom(http.get('/assets/data.json'));
    const result = expect(response).rejects.toMatchObject({ status: 0 });

    controller.expectOne('/assets/data.json').error(new ProgressEvent('error'));

    await result;
    expect(network.isOffline()).toBe(false);
  });
});
