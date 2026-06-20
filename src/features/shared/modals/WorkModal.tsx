import { TheatreItem } from "../../../types";
import { EditModal } from "./EditModal";
import { PosterModal } from "./PosterModal";
import { ScriptModal } from "./ScriptModal";
import { RecommendationStaticModal } from "./RecommendationStaticModal";

interface WorkModalProps {
  item: TheatreItem | null;
  onClose: () => void;
  standalone?: boolean;
  isActive?: boolean;
}

/**
 * Unified modal manager for various work types.
 * Dispatches to the specific modal component based on the item's category.
 */
export function WorkModal({ item, onClose, standalone = true, isActive = true }: WorkModalProps) {
  if (!item) return null;

  const category = item.category || "Edit";

  switch (category) {
    case "Edit":
      return <EditModal item={item} onClose={onClose} standalone={standalone} isActive={isActive} />;
    case "Poster":
      return <PosterModal item={item} onClose={onClose} standalone={standalone} isActive={isActive} />;
    case "Script":
      return <ScriptModal item={item} onClose={onClose} standalone={standalone} isActive={isActive} />;
    case "Recommendation":
      return <RecommendationStaticModal item={item} onClose={onClose} standalone={standalone} isActive={isActive} />;
    default:
      return <EditModal item={item} onClose={onClose} standalone={standalone} isActive={isActive} />;
  }
}
