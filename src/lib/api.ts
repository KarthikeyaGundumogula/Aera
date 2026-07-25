/**
 * src/lib/api.ts
 *
 * Central API client configuration for Aera.
 *
 * The base URL is driven by the VITE_API_URL environment variable:
 *   - Local dev:    VITE_API_URL=http://localhost:8000  (tars in local mode)
 *   - E2E testing:  VITE_API_URL=http://localhost:8080  (tars in test/e2e mode)
 *   - Production:   VITE_API_URL=https://api.framehouse.in  (or equivalent)
 *
 * USAGE:
 *   import { apiUrl, apiFetch } from '@/lib/api';
 *
 *   // Build a URL manually
 *   const url = apiUrl('/auth/login');
 *
 *   // Use the fetch wrapper (handles credentials cookie forwarding automatically)
 *   const response = await apiFetch('/auth/me');
 *   const data = await apiFetch('/works/new/film', { method: 'POST', body: JSON.stringify(payload) });
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

/**
 * API base URL resolved from the VITE_API_URL environment variable.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time.
 * At runtime during `vite dev`, these are resolved from the active .env file.
 *
 * Falls back to empty string if not set (relative URLs — useful for proxy setups).
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '';

/**
 * Builds a full API URL by appending a path to the base URL.
 *
 * @param path - API path starting with `/`, e.g. `/auth/login`
 * @returns Full URL string, e.g. `http://localhost:8000/auth/login`
 *
 * @example
 * apiUrl('/auth/me')         // → "http://localhost:8000/auth/me"
 * apiUrl('/works/new/film')  // → "http://localhost:8000/works/new/film"
 */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────────

/**
 * Default fetch options applied to every API request:
 * - `credentials: 'include'` — forwards the HttpOnly auth cookie set by tars
 * - `headers` — sets Content-Type to application/json by default
 */
const DEFAULT_OPTIONS: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Typed API fetch wrapper.
 *
 * Wraps the native `fetch` API with:
 *   - Automatic base URL resolution
 *   - Cookie credential forwarding
 *   - Content-Type JSON header
 *
 * @param path    - API path relative to base URL
 * @param options - Optional RequestInit overrides (method, body, headers, etc.)
 * @returns Raw `Response` object — caller is responsible for parsing
 *
 * @example
 * const res = await apiFetch('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ user_name: 'john', password: 'secret' }),
 * });
 * if (res.ok) {
 *   const data = await res.json();
 * }
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const mergedOptions: RequestInit = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_OPTIONS.headers,
      ...(options?.headers ?? {}),
    },
  };
  return fetch(url, mergedOptions);
}
