import { TheatreItem } from "../../../types";
import { EditModal } from "./EditModal";
import { PosterModal } from "./PosterModal";
import { ScriptModal } from "./ScriptModal";

interface WorkModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

/**
 * Unified modal manager for various work types.
 * Dispatches to the specific modal component based on the item's category.
 */
export function WorkModal({ item, onClose }: WorkModalProps) {
  if (!item) return null;

  switch (item.category) {
    case "Edit":
      return <EditModal item={item} onClose={onClose} />;
    case "Poster":
      return <PosterModal item={item} onClose={onClose} />;
    case "Script":
      return <ScriptModal item={item} onClose={onClose} />;
    default:
      console.warn(`Unknown work category: ${item.category}`);
      return null;
  }
}
