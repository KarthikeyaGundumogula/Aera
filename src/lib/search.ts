/**
 * src/lib/search.ts
 *
 * Unified search module for Aera.
 *
 * Exports:
 *   - All typed search hit interfaces (ArtistHit, OriginalHit, SetHit, WorkHit)
 *   - SearchResults: full multi-category response envelope
 *   - SearchCategory: literal union matching tars SearchCategory enum
 *   - useSearchQuery<C>: generic reusable hook
 *       · 300ms debounce
 *       · 2-character minimum threshold
 *       · AbortController — cancels in-flight requests on new keystroke
 *       · LRU cache (max 50 entries, 5-min TTL) — cache key = `${category}:${query}`
 *         so category-scoped queries never collide with global results
 *
 * Usage:
 *
 *   // Full multi-category search (global overlay)
 *   const { results, loading, error } = useSearchQuery('all', query);
 *   results.artists / results.originals / results.sets / results.works
 *
 *   // Scoped single-category search (e.g. CreditsStep originals picker)
 *   const { results, loading } = useSearchQuery('originals', query);
 *   results.originals  // ← only this will be populated
 *
 *   // Artists-only search
 *   const { results } = useSearchQuery('artists', query);
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

// ─── Response Hit Types ────────────────────────────────────────────────────────

export interface ArtistHit {
  id: string;
  userName: string;
  stageName?: string;
  tagLine: string;
  profilePicture?: string;
  score: number;
}

export interface OriginalHit {
  id: string;
  title: string;
  coverImg: string;
  score: number;
}

export interface SetHit {
  id: string;
  name: string;
  statement: string;
  score: number;
}

export interface WorkHit {
  id: string;
  title?: string;
  category: string;
  score: number;
}

export interface SearchResults {
  artists: ArtistHit[];
  originals: OriginalHit[];
  sets: SetHit[];
  works: WorkHit[];
}

// ─── Category ─────────────────────────────────────────────────────────────────

/**
 * Pass 'all' to fan-out all four queries concurrently on the backend.
 * Pass a specific category to hit only that entity's BM25 index.
 */
export type SearchCategory = 'all' | 'artists' | 'originals' | 'sets' | 'works';

// ─── Constants ─────────────────────────────────────────────────────────────────

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_CHARS = 2;

export const EMPTY_RESULTS: SearchResults = {
  artists: [],
  originals: [],
  sets: [],
  works: [],
};

// ─── LRU-style cache ──────────────────────────────────────────────────────────
// Module-scoped so it persists across re-renders and component remounts.
// Cache key includes the category so `artists:karthik` ≠ `all:karthik`.

const CACHE_MAX = 50;
const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

interface CacheEntry {
  results: SearchResults;
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();

function buildCacheKey(category: SearchCategory, query: string): string {
  return `${category}:${query}`;
}

function getCached(key: string): SearchResults | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return entry.results;
}

function setCache(key: string, results: SearchResults): void {
  if (searchCache.size >= CACHE_MAX) {
    const oldest = searchCache.keys().next().value;
    if (oldest !== undefined) searchCache.delete(oldest);
  }
  searchCache.set(key, { results, timestamp: Date.now() });
}

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildSearchUrl(category: SearchCategory, query: string): string {
  const base = `/search?q=${encodeURIComponent(query)}`;
  return category === 'all' ? base : `${base}&category=${category}`;
}

// ─── Core fetch (no React) — usable in imperative contexts too ────────────────

/**
 * Imperative search helper — resolves a single search request.
 * Throws on network failure or non-ok HTTP status.
 * Does NOT use the in-memory cache (intended for one-off programmatic calls).
 */
export async function fetchSearchResults(
  category: SearchCategory,
  query: string,
  signal?: AbortSignal,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < SEARCH_MIN_CHARS) return { ...EMPTY_RESULTS };

  const res = await apiFetch(buildSearchUrl(category, trimmed), { signal });

  if (!res.ok) throw new Error(`Search request failed with status ${res.status}`);

  const data = await res.json().catch(() => ({}));
  return {
    artists: Array.isArray(data.artists) ? data.artists : [],
    originals: Array.isArray(data.originals) ? data.originals : [],
    sets: Array.isArray(data.sets) ? data.sets : [],
    works: Array.isArray(data.works) ? data.works : [],
  };
}

// ─── Generic React hook ───────────────────────────────────────────────────────

export interface UseSearchQueryState {
  results: SearchResults;
  loading: boolean;
  error: string | null;
  debouncedQuery: string;
}

/**
 * useSearchQuery — reusable search hook.
 *
 * @param category  Which entity to search. 'all' runs a global fan-out.
 * @param query     Raw input string (straight from onChange / state).
 * @param debounceMs  Optional debounce override (default: 300ms).
 * @param minChars    Optional minimum query length (default: 2).
 */
export function useSearchQuery(
  category: SearchCategory,
  query: string,
  debounceMs = SEARCH_DEBOUNCE_MS,
  minChars = SEARCH_MIN_CHARS,
): UseSearchQueryState {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Debounce raw input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // 2. Fetch with AbortController + LRU cache
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < minChars) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = buildCacheKey(category, trimmed);
    const cached = getCached(cacheKey);

    if (cached) {
      setResults(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    const run = async () => {
      try {
        const fresh = await fetchSearchResults(category, trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setCache(cacheKey, fresh);
        setResults(fresh);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError('Search unavailable. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [debouncedQuery, category, minChars]);

  return { results, loading, error, debouncedQuery };
}
