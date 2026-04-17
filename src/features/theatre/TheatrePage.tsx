import { useState } from "react";
import { TheatreItem } from "../../types";
import { TheatreLayout } from "./layouts/TheatreLayout";
import { WorkModal } from "../shared/modals";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export function TheatrePage() {
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const isMobile = useMediaQuery();

  const handleSelectItem = (item: TheatreItem | null) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <TheatreLayout selectedItem={selectedItem} setSelectedItem={handleSelectItem} isMobile={isMobile} />
      <WorkModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
