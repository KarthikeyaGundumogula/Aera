import { useState } from "react";
import { TheatreItem } from "../../types";
import { TheatreLayout } from "./layouts/TheatreLayout";
import { QuickView } from "../shared/QuickView";
import { WorkModal } from "../shared/WorkModal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { isEditWork } from "../shared/work";

export function TheatrePage() {
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [selectedWork, setSelectedWork] = useState<TheatreItem | null>(null);
  const [currentItems, setCurrentItems] = useState<TheatreItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState(1);
  const isMobile = useMediaQuery();

  const handleSelectItem = (item: TheatreItem | null, items: TheatreItem[] = [], columns: number = 1) => {
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
      <TheatreLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} isMobile={isMobile} />
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
