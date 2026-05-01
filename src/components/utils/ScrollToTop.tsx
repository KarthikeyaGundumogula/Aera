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
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
