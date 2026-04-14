import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../types";
import { HomeFeedLayout } from "./layouts/HomeFeedLayout";
import { QuickView } from "../shared/QuickView";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export function Home() {
  const isMobile = useMediaQuery();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const navigate = useNavigate();

  // Auto-redirect to Theatre for Desktop/Tablet on first load
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedDesktop');
    if (!isMobile && !hasVisited) {
      sessionStorage.setItem('hasVisitedDesktop', 'true');
      navigate('/theatre', { replace: true });
    }
  }, [isMobile, navigate]);

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
    if (item?.originalId) {
      navigate(`/originals/${item.originalId}`);
      return;
    }
    setSelectedItem(item);
    if (item) {
      setCurrentItems(items);
      setCurrentColumns(columns);
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
    </div>
  );
}
