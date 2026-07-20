import { useParams, useNavigate, useLocation } from "react-router-dom";
import { GRID_ITEMS } from "../../mock";
import { useAuth } from "../../context/AuthContext";
import { EditViewer } from "./layouts/EditViewer";
import { PosterViewer } from "./layouts/PosterViewer";
import { StoryboardViewer } from "./layouts/StoryboardViewer";
import { RecommendationViewer } from "./layouts/RecommendationViewer";

/**
 * WorkPage — The Viewer Screen at /works/:id
 *
 * Rendering modes:
 *
 * 1. IN-APP NAVIGATION (state.item present):
 *    - The item is passed directly from useWorkNavigation for instant render.
 *    - No data fetch needed.
 *
 * 2. DIRECT LINK / REFRESH / SHARED URL:
 *    - No state.item — look up by id in userWorks then GRID_ITEMS.
 *    - Shows a not-found screen if the id doesn't match anything.
 *
 * The format-specific layout is determined by item.category:
 *   Edit         → EditViewer (cinematic video)
 *   Poster       → PosterViewer (gallery split-screen)
 *   Storyboard       → StoryboardViewer (filmstrip/magazine)
 *   Recommendation → RecommendationViewer (resonance card)
 *   default      → EditViewer
 */
export default function WorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userWorks } = useAuth();

  // Resolve item: state (instant) → userWorks → GRID_ITEMS
  const stateItem = location.state?.item;
  const item =
    stateItem ||
    userWorks.find((w) => w.id === id) ||
    GRID_ITEMS.find((w) => String(w.id) === id) ||
    null;

  // Not found
  if (!item) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080807]">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
          Work not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2.5 rounded-xl border border-white/15 text-white/50 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all"
        >
          Return to Theatre
        </button>
      </div>
    );
  }

  const category = item.category ?? "Edit";

  switch (category) {
    case "Poster":
      return <PosterViewer item={item} />;
    case "Storyboard":
      return <StoryboardViewer item={item} />;
    case "Recommendation":
      return <RecommendationViewer item={item} />;
    case "Edit":
    case "Call":
    default:
      return <EditViewer item={item} />;
  }
}
