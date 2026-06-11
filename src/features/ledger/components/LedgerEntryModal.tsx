import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AddLedgerEntry } from "./AddLedgerEntry";
import { mockLedger, LedgerItem } from "../../../mock/ledger";

interface LedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LedgerEntryModal({ isOpen, onClose }: LedgerEntryModalProps) {
  const [existingIds, setExistingIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setExistingIds(mockLedger.map(l => l.originalId));
    }
  }, [isOpen]);

  const handleAdd = (entry: LedgerItem) => {
    // Mutate the mock ledger array so that the state persists across navigation
    mockLedger.unshift(entry);
    // Dispatch a global event so the LedgerPage can update its local state if currently mounted
    window.dispatchEvent(new CustomEvent("ledgerUpdated"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
          >
            <AddLedgerEntry
              existingIds={existingIds}
              onAdd={handleAdd}
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
