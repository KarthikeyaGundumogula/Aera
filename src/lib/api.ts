/**
 * src/lib/api.ts
 *
 * Central API client configuration & error interceptor for Aera.
 *
 * The base URL is driven by the VITE_API_URL environment variable:
 *   - Local dev:    VITE_API_URL=http://localhost:8000  (tars in local mode)
 *   - E2E testing:  VITE_API_URL=http://localhost:8080  (tars in test/e2e mode)
 *   - Production:   VITE_API_URL=https://api.framehouse.in  (or equivalent)
 *
 * USAGE:
 *   import { apiUrl, apiFetch, onApiError } from '@/lib/api';
 *
 *   // Listen to all API errors globally
 *   const unbind = onApiError((err) => console.log(err.message));
 *
 *   // Perform API call — response.apiError holds structured error details if !res.ok
 *   const response = await apiFetch('/auth/me');
 *   if (!response.ok) {
 *     console.log(response.apiError?.message);
 *   }
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────

const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '';

/**
 * Builds a full API URL by appending a path to the base URL.
 *
 * @param path - API path starting with `/`, e.g. `/auth/login`
 * @returns Full URL string, e.g. `http://localhost:8000/auth/login`
 */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// ─── Types & Global Error Interceptor ─────────────────────────────────────────

export interface ApiErrorDetail {
  path: string;
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  message: string;
  errorData?: unknown;
  timestamp: string;
  networkError?: Error;
}

export type ApiErrorListener = (error: ApiErrorDetail) => void;

const errorListeners = new Set<ApiErrorListener>();

/**
 * Register a global listener to be called whenever any API request fails
 * (either a non-2xx HTTP response or a network exception).
 *
 * Returns an unbind function.
 */
export function onApiError(listener: ApiErrorListener): () => void {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

/**
 * Response object augmented with parsed API error metadata on non-OK responses.
 */
export interface ApiResponse extends Response {
  apiError?: ApiErrorDetail;
}

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Helper function to extract a human-readable error message from an error payload.
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data.trim() || fallback;
  if (typeof data === 'object') {
    const obj = data as Record<string, any>;
    if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
    if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
    if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
    if (typeof obj.msg === 'string' && obj.msg.trim()) return obj.msg;
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return obj.errors.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
    }
  }
  return fallback;
}

/**
 * Parses and dispatches API errors to listeners and window events.
 */
async function processApiError(
  path: string,
  url: string,
  method: string,
  res?: Response,
  networkErr?: Error
): Promise<ApiErrorDetail> {
  let message = res ? `HTTP ${res.status} ${res.statusText || 'Error'}` : (networkErr?.message || 'Network request failed');
  let errorData: unknown = null;

  if (res) {
    try {
      const clone = res.clone();
      const text = await clone.text();
      try {
        const json = JSON.parse(text);
        errorData = json;
        message = extractErrorMessage(json, message);
      } catch {
        if (text && text.trim()) {
          message = text.trim();
        }
      }
    } catch {
      // Ignore cloning/text parsing failures
    }
  }

  const errorDetail: ApiErrorDetail = {
    path,
    url,
    method,
    status: res?.status,
    statusText: res?.statusText,
    message,
    errorData,
    timestamp: new Date().toISOString(),
    networkError: networkErr,
  };

  // Structured console warning for debugging
  console.warn(`[API Error] ${method} ${path}${res ? ` (${res.status})` : ' [Network Failure]'}:`, message, errorData ?? '');

  // Dispatch custom DOM event if running in browser
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ApiErrorDetail>('aera:api-error', { detail: errorDetail })
    );
  }

  // Notify registered callbacks
  errorListeners.forEach((listener) => {
    try {
      listener(errorDetail);
    } catch (e) {
      console.error('[API Error Listener Error]', e);
    }
  });

  return errorDetail;
}

// ─── Refresh Token Queue & Flow ───────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

/**
 * Executes a token refresh request against the backend.
 * Uses native fetch to avoid recursion.
 * On success, backend sets new rotated auth_token and refresh_token cookies.
 */
async function performTokenRefresh(): Promise<boolean> {
  try {
    const refreshUrl = apiUrl('/auth/refresh');
    const res = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      return true;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aera:auth-expired'));
    }
    return false;
  } catch (err) {
    console.warn('[apiFetch] Token refresh network error:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aera:auth-expired'));
    }
    return false;
  }
}

/**
 * Deduplicates in-flight refresh requests to ensure only one token rotation
 * call executes at a time, preventing token replay rejections.
 */
function requestTokenRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Typed API fetch wrapper.
 *
 * Wraps native `fetch` with:
 *   - Base URL resolution (`VITE_API_URL`)
 *   - Cookie credential forwarding (`credentials: 'include'`)
 *   - Content-Type JSON header
 *   - Automatic 401 refresh token rotation & request replay
 *   - Automatic error intercepting & parsing for non-2xx responses and network failures
 *
 * @param path    - API path relative to base URL
 * @param options - Optional RequestInit overrides (method, body, headers, etc.)
 * @param isRetry - Internal flag preventing infinite retry loops
 * @returns Response object carrying optional `.apiError` property if !res.ok
 */
export async function apiFetch(
  path: string,
  options?: RequestInit,
  isRetry = false
): Promise<ApiResponse> {
  const url = apiUrl(path);
  const method = (options?.method ?? 'GET').toUpperCase();
  const mergedOptions: RequestInit = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_OPTIONS.headers,
      ...(options?.headers ?? {}),
    },
  };

  try {
    const response: ApiResponse = await fetch(url, mergedOptions);

    // If 401 Unauthorized occurs on a non-auth endpoint, attempt token refresh and replay once
    if (response.status === 401 && !isRetry && !/^\/?auth\//i.test(path)) {
      const refreshed = await requestTokenRefresh();
      if (refreshed) {
        return await apiFetch(path, options, true);
      }
    }

    if (!response.ok) {
      const errorDetail = await processApiError(path, url, method, response);
      response.apiError = errorDetail;
    }

    return response;
  } catch (err: any) {
    const networkErr = err instanceof Error ? err : new Error(String(err));
    await processApiError(path, url, method, undefined, networkErr);
    throw err;
  }
}
