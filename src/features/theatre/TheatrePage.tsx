import { useState } from "react";
import { TheatreItem } from "../../types";
import { TheatreLayout } from "./layouts/TheatreLayout";
import { QuickView } from "../shared/QuickView";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export function TheatrePage() {
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const isMobile = useMediaQuery();

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
    setSelectedItem(item);
    if (item) {
      setCurrentItems(items);
      setCurrentColumns(columns);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <TheatreLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} isMobile={isMobile} />
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
