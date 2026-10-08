export const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export class ApiError extends Error {}

export class ApiNetworkError extends ApiError {}

export async function fetchJson<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new ApiNetworkError('Network error');
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiNetworkError('Network error');
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
