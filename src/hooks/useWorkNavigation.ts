import { useNavigate, useLocation } from "react-router-dom";
import { TheatreItem } from "../types";

import { useFeedContext } from "../context/FeedContext";

/**
 * useWorkNavigation
 *
 * Replaces setIsModalOpen(true) across all work card components.
 * Navigates to /works/:id while passing the current location as
 * backgroundLocation state so the background page stays rendered.
 *
 * On the receiving end (App.tsx), the router renders both:
 *   - The current "background" page at backgroundLocation
 *   - The /works/:id route as a floating modal overlay
 *
 * Clicking outside (ModalWrapper backdrop) calls navigate(-1) to return.
 */
export function useWorkNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const feedContext = useFeedContext();

  const openWork = (item: TheatreItem) => {
    navigate(`/works/${item.id}`, {
      state: { backgroundLocation: location, item, feedContext },
    });
  };

  return { openWork };
}
