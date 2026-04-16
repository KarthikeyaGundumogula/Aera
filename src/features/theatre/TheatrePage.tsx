import { useState } from "react";
import { TheatreItem } from "../../types";
import { TheatreLayout } from "./layouts/TheatreLayout";
import { PosterModal, ScriptModal, EditModal } from "../shared/modals";
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
