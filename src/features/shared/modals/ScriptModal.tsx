import { TheatreItem } from "../../../types";
import { StaticFrame } from "./StaticFrame";

interface ScriptModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

/**
 * ScriptModal — Multi-page static content viewer.
 * Thin wrapper around StaticFrame with pages + flip-to-details enabled.
 */
export function ScriptModal({ item, onClose }: ScriptModalProps) {
  if (!item) return null;

  return (
    <StaticFrame
      item={item}
      onClose={onClose}
      archiveLabel="Script Archive"
      showPages={true}
      showDetails={true}
      showClutterFreeToggle={true}
    />
  );
}
