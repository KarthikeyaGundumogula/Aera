import { TheatreItem } from "../../../types";
import { EditFrame } from "./EditFrame";

interface EditModalProps {
  item: TheatreItem | null;
  onClose: () => void;
  standalone?: boolean;
}

/**
 * EditModal — Wrapper for Edit content.
 * Now delegates to EditFrame for the wide, consistent layout without flipping.
 */
export function EditModal({ item, onClose, standalone = true }: EditModalProps) {
  if (!item) return null;

  return (
    <EditFrame
      item={item}
      onClose={onClose}
      archiveLabel="Edit Archive"
      standalone={standalone}
    />
  );
}
