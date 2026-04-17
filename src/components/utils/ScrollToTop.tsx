import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that the scroll position is reset to the top
 * of the page whenever the route (pathname) changes.
 * This is essential for a seamless cinematic experience in a single-page app.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll
    window.scrollTo(0, 0);
    
    // Some layouts might use a full-height container with overflow-y-auto
    // We target the standard scrollable elements as well.
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach((container) => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}
