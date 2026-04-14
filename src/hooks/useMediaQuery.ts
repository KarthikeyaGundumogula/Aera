import { useState, useEffect } from "react";

/**
 * Reactive hook that tracks whether the viewport matches a given media query.
 * Defaults to `(max-width: 767px)` for mobile detection.
 *
 * @example
 * const isMobile = useMediaQuery();                          // mobile default
 * const isTablet = useMediaQuery("(max-width: 1024px)");     // custom query
 */
export function useMediaQuery(query = "(max-width: 767px)"): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Sync immediately in case SSR hydration differs
    setMatches(mql.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
