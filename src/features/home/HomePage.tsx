import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../types";
import { HomeFeedLayout } from "./layouts/HomeFeedLayout";
import { PosterModal, ScriptModal, EditModal } from "../shared/modals";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/** Key used to remember that a desktop redirect has already happened this session. */
const DESKTOP_REDIRECT_KEY = 'hasVisitedDesktop';

export function Home() {
  const isMobile = useMediaQuery();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const navigate = useNavigate();

  // Auto-redirect to Theatre for Desktop/Tablet on first load
  useEffect(() => {
    const hasVisited = sessionStorage.getItem(DESKTOP_REDIRECT_KEY);
    if (!isMobile && !hasVisited) {
      sessionStorage.setItem(DESKTOP_REDIRECT_KEY, 'true');
      navigate('/theatre', { replace: true });
    }
  }, [isMobile, navigate]);

  const handleSelectItem = (item: TheatreItem | null) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <HomeFeedLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} />
      
      {selectedItem?.category === "Edit" && (
        <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.category === "Poster" && (
        <PosterModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.category === "Script" && (
        <ScriptModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
