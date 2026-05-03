import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Tag } from "lucide-react";
import { ORIGINALS } from "../../../mock";
import { OWN_RELEASE_ORIGINAL } from "../../../constants/originals";

interface CurateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  originalIds: string[]; // Linked original IDs
  onShowToast: (msg: string) => void;
}

export function CurateOverlay({
  isOpen,
  onClose,
  originalIds,
  onShowToast,
}: CurateOverlayProps) {
  const navigate = useNavigate();
  const [ledgerOriginals, setLedgerOriginals] = useState<string[]>([]);
  const [taggedOriginals, setTaggedOriginals] = useState<string[]>([]);

  // Only show the originals that this fragment is related to
  const relatedOriginals = [
    ...(originalIds.includes("own-release") ? [OWN_RELEASE_ORIGINAL] : []),
    ...ORIGINALS.filter((item) => originalIds.includes(item.id))
  ];

  const handleAddToLedger = (id: string) => {
    if (ledgerOriginals.includes(id)) {
      onShowToast("Already Saved to Ledger");
    } else {
      setLedgerOriginals((prev) => [...prev, id]);
      onShowToast("Original Added to Ledger");
    }
  };

  const handleTagToLedger = (id: string) => {
    if (taggedOriginals.includes(id)) {
      onShowToast("Already Tagged to Original");
      return;
    }

    setTaggedOriginals((prev) => [...prev, id]);
    if (!ledgerOriginals.includes(id)) {
      setLedgerOriginals((prev) => [...prev, id]);
      onShowToast("Original Added & Fragment Tagged");
    } else {
      onShowToast("Fragment Tagged to Original");
    }
  };

  const handleNavigation = (id: string) => {
    if (id === "own-release") {
      navigate("/profile");
    } else {
      navigate(`/originals/${id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <div
            className="w-full sm:w-[85%] max-w-2xl overflow-y-auto space-y-2 sm:space-y-3 no-scrollbar max-h-full pb-4 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {relatedOriginals.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  No Linked Originals
                </p>
              </div>
            ) : (
              relatedOriginals.map((item) => {
                const inLedger = ledgerOriginals.includes(item.id);
                const isTagged = taggedOriginals.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all shadow-xl"
                  >
                    <img loading="lazy"
                      src={item.coverImage}
                      alt={item.title}
                      onClick={() => handleNavigation(item.id)}
                      className="w-14 h-9 sm:w-20 sm:h-12 object-cover rounded-md sm:rounded-lg opacity-90 cursor-pointer hover:opacity-100 transition-opacity"
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNavigation(item.id)}
                    >
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90 truncate hover:text-white transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 pr-1 sm:pr-2">
                      <button
                        onClick={() => handleAddToLedger(item.id)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all ${inLedger ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"}`}
                        title="Add to Ledger"
                      >
                        <Bookmark
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${inLedger ? "fill-current" : ""}`}
                        />
                      </button>
                      <button
                        onClick={() => handleTagToLedger(item.id)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all ${isTagged ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/50 hover:bg-white/10"}`}
                        title="Tag Fragment to Ledger"
                      >
                        <Tag
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${isTagged ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
