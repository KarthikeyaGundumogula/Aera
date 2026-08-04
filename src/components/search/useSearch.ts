/**
 * src/components/search/useSearch.ts
 *
 * Thin adapter — re-exports the global SearchResults type and wraps
 * useSearchQuery (from src/lib/search.ts) with 'all' category so the
 * GlobalSearch overlay continues to work without changes.
 *
 * For scoped searches (e.g. originals-only in CreditsStep) import
 * useSearchQuery directly from '@/lib/search'.
 */
export type {
  ArtistHit,
  OriginalHit,
  SetHit,
  WorkHit,
  SearchResults,
} from '@/lib/search';

export { useSearchQuery as useSearch } from '@/lib/search';

