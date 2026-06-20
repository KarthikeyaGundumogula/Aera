import { TheatreItem } from "../../../types";
import { StaticFrame } from "./StaticFrame";

interface RecommendationStaticModalProps {
  item: TheatreItem | null;
  onClose: () => void;
  standalone?: boolean;
  isActive?: boolean;
}

/**
 * RecommendationStaticModal — Static content viewer for Recommendations.
 * Thin wrapper around StaticFrame, which now handles injecting the ResonanceBars overlay.
 */
export function RecommendationStaticModal({ item, onClose, standalone = true, isActive = true }: RecommendationStaticModalProps) {
  if (!item) return null;

  return (
    <StaticFrame
      item={item}
      onClose={onClose}
      archiveLabel="Recommendation"
      showPages={false}
      showDetails={false}
      showClutterFreeToggle={true}
      standalone={standalone}
      isActive={isActive}
    />
  );
}
