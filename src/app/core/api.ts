import { HttpErrorResponse } from '@angular/common/http';

export interface ApiResponse<T> {
  data: T;
}

export const API_BASE_URL: string = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 0;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
