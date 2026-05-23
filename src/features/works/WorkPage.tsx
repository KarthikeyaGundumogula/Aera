import { useParams, useNavigate, useLocation } from "react-router-dom";
import { GRID_ITEMS } from "../../mock";
import { WorkModal } from "../shared/modals/WorkModal";
import { WorkSwiper } from "./components/WorkSwiper";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";

/**
 * WorkPage — The shareable work route at /works/:id
 *
 * Two rendering modes:
 *
 * 1. MODAL MODE (backgroundLocation in router state):
 *    - App.tsx renders the background page normally at backgroundLocation
 *    - This component renders on top as a floating overlay
 *    - Uses WorkSwiper if feedContext is provided
 *    - Closing navigates(-1) back to the background page
 *
 * 2. STANDALONE MODE (direct link / refresh / shared URL):
 *    - No backgroundLocation in state — user arrived via a direct share link
 *    - Renders the modal UI centered on a dark cinematic full-page backdrop
 *    - Closing navigates to Home (/) as a sensible fallback
 */
export default function WorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userWorks } = useAuth();

  // Try to find the item in:
  // 1. Navigation state (contains mockItem during upload preview)
  // 2. User-created works (supports dynamic works after full page refresh)
  // 3. Static mock works list
  const stateItem = location.state?.item;
  const feedContext = location.state?.feedContext;
  const item = stateItem || userWorks.find((w) => w.id === id) || GRID_ITEMS.find((w) => w.id === id) || null;

  const handleClose = () => {
    // If we came from within the app, go back. Otherwise, go to home.
    if (window.history.state?.usr?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // If the item is not found, return a minimal not-found overlay
  if (!item) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
        <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Work not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 rounded-full border border-white/20 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Return to Theatre
        </button>
      </div>
    );
  }

  if (feedContext && feedContext.length > 0) {
    return <WorkSwiper initialItem={item} feedContext={feedContext} onClose={handleClose} />;
  }

  return <WorkModal item={item} onClose={handleClose} />;
}
