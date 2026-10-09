import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchJson, postJson, ApiError, ApiNetworkError, API_BASE_URL } from './api';

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response;
}

function errorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as Response;
}

describe('fetchJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the given path under the API base URL and returns the parsed body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse({ data: 'ok' }));

    const result = await fetchJson<{ data: string }>('/games/demo-slug');

    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE_URL}/games/demo-slug`);
    expect(result).toEqual({ data: 'ok' });
  });

  it('throws ApiError (not ApiNetworkError) when the server responds with a non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(404));

    await expect(fetchJson('/games/missing-slug')).rejects.toThrow(ApiError);
    await expect(fetchJson('/games/missing-slug')).rejects.not.toBeInstanceOf(ApiNetworkError);
  });

  it('includes the status code in the ApiError message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(500));

    await expect(fetchJson('/games/demo-slug')).rejects.toThrow('500');
  });

  it('throws ApiNetworkError when fetch itself fails (no response received)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchJson('/games/demo-slug')).rejects.toThrow(ApiNetworkError);
  });
});

describe('postJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a POST request with a JSON body and the right content type', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse({ data: 'ok' }));

    await postJson('/comments/42/like', { userEmail: 'student@rs.school' });

    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE_URL}/comments/42/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: 'student@rs.school' }),
    });
  });

  it('throws ApiError when the server rejects the request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(errorResponse(400));

    await expect(postJson('/comments/42/like', {})).rejects.toThrow(ApiError);
  });

  it('throws ApiNetworkError when fetch itself fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Network request failed'));

    await expect(postJson('/comments/42/like', {})).rejects.toThrow(ApiNetworkError);
  });
});
