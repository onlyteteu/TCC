const DEFAULT_BACKEND_API_BASE_URL = "http://127.0.0.1:8000/api";

export function getBackendApiBaseUrl() {
  const configuredUrl =
    process.env.BACKEND_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_BACKEND_API_BASE_URL;

  return configuredUrl.replace(/\/$/, "");
}

export async function fetchBackend(path: string, init: RequestInit = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${getBackendApiBaseUrl()}${normalizedPath}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export async function readJsonResponse<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

