import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../types";
import { HomeFeedLayout } from "./layouts/HomeFeedLayout";
import { QuickView } from "../shared/QuickView";
import { WorkModal } from "../shared/WorkModal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { isEditWork } from "../shared/work";

/** Key used to remember that a desktop redirect has already happened this session. */
const DESKTOP_REDIRECT_KEY = 'hasVisitedDesktop';

export function Home() {
  const isMobile = useMediaQuery();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [selectedWork, setSelectedWork] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const navigate = useNavigate();

  // Auto-redirect to Theatre for Desktop/Tablet on first load
  useEffect(() => {
    const hasVisited = sessionStorage.getItem(DESKTOP_REDIRECT_KEY);
    if (!isMobile && !hasVisited) {
      sessionStorage.setItem(DESKTOP_REDIRECT_KEY, 'true');
      navigate('/theatre', { replace: true });
    }
  }, [isMobile, navigate]);

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
    if (item?.originalId) {
      navigate(`/originals/${item.originalId}`);
      return;
    }
    if (!item) {
      setSelectedItem(null);
      setSelectedWork(null);
      return;
    }

    if (!isEditWork(item)) {
      setSelectedItem(null);
      setSelectedWork(item);
      return;
    }

    setSelectedWork(null);
    setSelectedItem(item);
    if (item) {
      const quickItems = items.filter(isEditWork);
      setCurrentItems(quickItems.length > 0 ? quickItems : [item]);
      setCurrentColumns(columns > 0 ? columns : 1);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <HomeFeedLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} />
      
      <QuickView 
        selectedItem={selectedItem} 
        setSelectedItem={(item) => handleSelectItem(item, currentItems, currentColumns)} 
        isMobile={isMobile} 
        items={currentItems}
        columns={currentColumns}
      />

      <WorkModal item={selectedWork} onClose={() => setSelectedWork(null)} />
    </div>
  );
}
