import { TheatreItem } from "../../../types";
import { StaticFrame } from "./StaticFrame";

interface PosterModalProps {
  item: TheatreItem | null;
  onClose: () => void;
  standalone?: boolean;
  isActive?: boolean;
}

/**
 * PosterModal — Single-image static content viewer.
 * Thin wrapper around StaticFrame with no pages, no flip.
 * Includes a subtle eye toggle for clutter-free / focus mode.
 */
export function PosterModal({ item, onClose, standalone = true, isActive = true }: PosterModalProps) {
  if (!item) return null;

  return (
    <StaticFrame
      item={item}
      onClose={onClose}
      archiveLabel="Poster"
      showPages={false}
      showDetails={false}
      showClutterFreeToggle={true}
      standalone={standalone}
      isActive={isActive}
    />
  );
}
