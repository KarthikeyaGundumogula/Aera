import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../types";
import { MobileLayout } from "../layouts/MobileLayout";
import { DesktopLayout } from "../layouts/DesktopLayout";
import { QuickView } from "../components/QuickView";

export function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
    if (item?.screenId) {
      navigate(`/screens/${item.screenId}`);
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
      {isMobile ? (
        <MobileLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} />
      ) : (
        <DesktopLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} />
      )}
      
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
