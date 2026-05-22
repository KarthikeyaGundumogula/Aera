import { useState, useEffect } from 'react';
import { GRID_ITEMS, PROFILES_DIRECTORY, ProfileEntry } from '../../mock';
import { TheatreItem } from '../../types';

export interface SearchResults {
  films: TheatreItem[];
  artists: ProfileEntry[];
}

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<SearchResults>({ films: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Strict 300ms Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    // Clear timeout if query changes before 300ms elapses
    return () => clearTimeout(handler);
  }, [query]);

  // 2. Simulated API Integration with Race Condition Prevention
  useEffect(() => {
    // DO NOT call API if debouncedQuery length is less than 2
    if (debouncedQuery.trim().length < 2) {
      setResults({ films: [], artists: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Use AbortController to cancel previous in-flight requests if debouncedQuery changes again
    const abortController = new AbortController();

    const fetchResults = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Critical: Check if request was aborted during the network delay
        if (abortController.signal.aborted) return;

        const lowerQuery = debouncedQuery.toLowerCase();

        // Simulate backend fuzzy search logic
        const filteredFilms = GRID_ITEMS.filter(item => {
          const t = item.title || "";
          const a = item.artist || "";
          return t.toLowerCase().includes(lowerQuery) || a.toLowerCase().includes(lowerQuery);
        }).slice(0, 4); // Limit to top 4

        const filteredArtists = PROFILES_DIRECTORY.filter(artist => 
          artist.name.toLowerCase().includes(lowerQuery) ||
          artist.tagline?.toLowerCase().includes(lowerQuery)
        ).slice(0, 4); // Limit to top 4

        // Only update UI from the latest request
        setResults({
          films: filteredFilms,
          artists: filteredArtists
        });
      } catch (err) {
        // Ensure we don't set error state if it was an intentional abort
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

    // Cleanup: Abort the fetch if debouncedQuery changes before it finishes
    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  return { debouncedQuery, results, loading, error };
}
