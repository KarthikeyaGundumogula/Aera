import { useState, useEffect } from 'react';
import { GRID_ITEMS, PROFILES_DIRECTORY, ProfileEntry } from '../../mock';
import { TheatreItem } from '../../types';

export interface SearchResults {
  films: TheatreItem[];
  artists: ProfileEntry[];
}

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResults>({
    films: GRID_ITEMS.slice(0, 4),
    artists: PROFILES_DIRECTORY.slice(0, 4),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Strict 300ms Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // 2. Search & Suggestion Engine with AbortController & 2-Character Minimum Threshold
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    // Default suggestions when query is less than 2 characters (no API trigger)
    if (trimmed.length < 2) {
      setResults({
        films: GRID_ITEMS.slice(0, 4),
        artists: PROFILES_DIRECTORY.slice(0, 4),
      });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const abortController = new AbortController();

    const fetchResults = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (abortController.signal.aborted) return;

        const lowerQuery = trimmed.toLowerCase();

        const filteredFilms = GRID_ITEMS.filter((item) => {
          const t = item.title || "";
          const a = item.artist || "";
          return t.toLowerCase().includes(lowerQuery) || a.toLowerCase().includes(lowerQuery);
        }).slice(0, 4);

        const filteredArtists = PROFILES_DIRECTORY.filter(
          (artist) =>
            artist.name.toLowerCase().includes(lowerQuery) ||
            artist.tagline?.toLowerCase().includes(lowerQuery)
        ).slice(0, 4);

        setResults({
          films: filteredFilms,
          artists: filteredArtists,
        });
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Failed to fetch suggestions. Please try again.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  return { debouncedQuery, results, loading, error };
}
