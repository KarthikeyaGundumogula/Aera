import { useState, useEffect } from "react";
import { TheatreItem } from "../types";
import { TheatreLayout } from "../layouts/TheatreLayout";
import { QuickView } from "../components/QuickView";

export function TheatrePage() {
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
    setSelectedItem(item);
    if (item) {
      setCurrentItems(items);
      setCurrentColumns(columns);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <TheatreLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} />
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
