import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TheatreItem } from "../types";
import { FeedContext } from "../context/FeedContext";

/**
 * useWorkNavigation
 *
 * Navigates to /works/:id as a standard full-page push.
 * The item and surrounding feed items (from FeedContext) are passed in state
 * for instant rendering and feed-context navigation in the viewer.
 * If already inside a work (a tunnel), it replaces the history entry so the back button
 * escapes directly back to the original entry point (e.g. Home or Search).
 */
export function useWorkNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const feedItems = useContext(FeedContext);

  const openWork = (item: TheatreItem, explicitFeedItems?: TheatreItem[]) => {
    const isAlreadyInTunnel = location.pathname.startsWith("/works/");
    const locationState = location.state as { item?: TheatreItem; feedItems?: TheatreItem[] } | null;
    const contextItems = explicitFeedItems || feedItems || locationState?.feedItems || [];

    navigate(`/works/${item.id}`, {
      state: { item, feedItems: contextItems },
      replace: isAlreadyInTunnel,
    });
  };

  return { openWork };
}
