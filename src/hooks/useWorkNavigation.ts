import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../types";

/**
 * useWorkNavigation
 *
 * Navigates to /works/:id as a standard full-page push.
 * The item is passed in state for instant rendering before any data fetch.
 * No backgroundLocation — the Exhibition Screen is the destination, not an overlay.
 */
export function useWorkNavigation() {
  const navigate = useNavigate();

  const openWork = (item: TheatreItem) => {
    navigate(`/works/${item.id}`, {
      state: { item },
    });
  };

  return { openWork };
}
