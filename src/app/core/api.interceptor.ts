import {
  HttpErrorResponse,
  type HttpEvent,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, type Observable, retry, tap, throwError, timer } from 'rxjs';
import { API_BASE_URL, isNetworkError } from './api';
import { NetworkStatusService } from './network-status.service';

export const MAX_RETRIES: number = 2;
export const RETRY_DELAY_MS: number = 500;

function isWorthRetrying(error: unknown): boolean {
  return isNetworkError(error) || (error instanceof HttpErrorResponse && error.status >= 500);
}

export const apiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!request.url.startsWith(API_BASE_URL)) {
    return next(request);
  }

  const network: NetworkStatusService = inject(NetworkStatusService);
  const canRetry: boolean = request.method === 'GET';

  return next(request).pipe(
    retry({
      count: canRetry ? MAX_RETRIES : 0,
      delay: (error: unknown, retryCount: number) =>
        isWorthRetrying(error) ? timer(retryCount * RETRY_DELAY_MS) : throwError(() => error),
    }),
    tap(() => network.markOnline()),
    catchError((error: unknown) => {
      if (isNetworkError(error)) {
        network.markOffline();
      }

      return throwError(() => error);
    })
  );
};
