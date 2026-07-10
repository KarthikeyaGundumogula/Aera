import { useNavigate, useLocation } from "react-router-dom";
import { TheatreItem } from "../types";

/**
 * useWorkNavigation
 *
 * Navigates to /works/:id as a standard full-page push.
 * The item is passed in state for instant rendering before any data fetch.
 * If already inside a work (a tunnel), it replaces the history entry so the back button
 * escapes directly back to the original entry point (e.g. Home or Search).
 */
export function useWorkNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const openWork = (item: TheatreItem) => {
    const isAlreadyInTunnel = location.pathname.startsWith("/works/");
    
    navigate(`/works/${item.id}`, {
      state: { item },
      replace: isAlreadyInTunnel,
    });
  };

  return { openWork };
}
