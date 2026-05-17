import { useParams, useNavigate } from "react-router-dom";
import { GRID_ITEMS } from "../../mock";
import { WorkModal } from "../shared/modals/WorkModal";
import { motion } from "motion/react";

/**
 * WorkPage — The shareable work route at /works/:id
 *
 * Two rendering modes:
 *
 * 1. MODAL MODE (backgroundLocation in router state):
 *    - App.tsx renders the background page normally at backgroundLocation
 *    - This component renders on top as a floating overlay
 *    - Closing navigates(-1) back to the background page
 *
 * 2. STANDALONE MODE (direct link / refresh / shared URL):
 *    - No backgroundLocation in state — user arrived via a direct share link
 *    - Renders the modal UI centered on a dark cinematic full-page backdrop
 *    - Closing navigates to /theatre as a sensible fallback
 */
export default function WorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const item = GRID_ITEMS.find((w) => w.id === id) ?? null;

  const handleClose = () => {
    // If we came from within the app, go back. Otherwise, go to theatre.
    if (window.history.state?.usr?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate("/theatre");
    }
  };

  // If the item is not found, return a minimal not-found overlay
  if (!item) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl">
        <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Work not found</p>
        <button
          onClick={() => navigate("/theatre")}
          className="mt-6 px-6 py-2 rounded-full border border-white/20 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Return to Theatre
        </button>
      </div>
    );
  }

  return <WorkModal item={item} onClose={handleClose} />;
}
