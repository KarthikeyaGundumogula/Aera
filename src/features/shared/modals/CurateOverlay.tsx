import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Tag } from "lucide-react";
import { LedgerAction } from "../../../components/actions/LedgerAction";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { LinkedOriginal } from "../../../types";

interface CurateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  originals: LinkedOriginal[];
  workId?: string | number;
  isLoading?: boolean;
  onShowToast: (msg: string) => void;
}

export function CurateOverlay({
  isOpen,
  onClose,
  originals,
  workId,
  isLoading = false,
  onShowToast,
}: CurateOverlayProps) {
  const navigate = useNavigate();
  const { currentArtist } = useAuth();
  const [ledgerOriginals, setLedgerOriginals] = useState<string[]>([]);
  const [taggedOriginals, setTaggedOriginals] = useState<string[]>([]);

  // Pre-load user's favorited originals if logged in
  useEffect(() => {
    if (isOpen && currentArtist) {
      apiFetch("/library")
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const items = json.data ?? [];
            if (Array.isArray(items)) {
              const favoritedIds = items.map((e: any) => e.originalId || e.id).filter(Boolean);
              setLedgerOriginals(favoritedIds);
            }
          }
        })
        .catch(() => undefined);
    }
  }, [isOpen, currentArtist]);

  const handleAddToLedger = async (id: string) => {
    if (!currentArtist) {
      onShowToast("Sign in required to add to Ledger");
      return;
    }

    const isCurrentlyInLedger = ledgerOriginals.includes(id);

    try {
      const endpoint = isCurrentlyInLedger ? "/originals/unfavorite" : "/originals/favorite";
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(id),
      });

      if (res.ok) {
        if (isCurrentlyInLedger) {
          setLedgerOriginals((prev) => prev.filter((item) => item !== id));
          onShowToast("Original Removed from Ledger");
        } else {
          setLedgerOriginals((prev) => [...prev, id]);
          onShowToast("Original Added to Ledger");
        }
      } else {
        onShowToast("Failed to update Ledger");
      }
    } catch (err) {
      console.error("[CurateOverlay] Failed to update ledger status:", err);
      onShowToast("Network error updating Ledger");
    }
  };

  const handleTagToLedger = async (id: string) => {
    if (!currentArtist) {
      onShowToast("Sign in required to tag work");
      return;
    }

    if (taggedOriginals.includes(id)) {
      onShowToast("Already Tagged to Original");
      return;
    }

    try {
      // Ensure the original is favorited in the ledger first
      if (!ledgerOriginals.includes(id)) {
        await apiFetch("/originals/favorite", {
          method: "POST",
          body: JSON.stringify(id),
        });
        setLedgerOriginals((prev) => [...prev, id]);
      }

      setTaggedOriginals((prev) => [...prev, id]);
      onShowToast("Work tagged to Original");
    } catch (err) {
      console.error("[CurateOverlay] Failed to tag work:", err);
      onShowToast("Network error tagging work");
    }
  };

  const handleNavigation = (id: string) => {
    navigate(`/originals/${id}`);
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
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-60">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-xl animate-spin" />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">Loading Originals</p>
              </div>
            ) : originals.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  No Linked Originals
                </p>
              </div>
            ) : (
              originals.map((item) => {
                const inLedger = ledgerOriginals.includes(item.id);
                const isTagged = taggedOriginals.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all shadow-xl"
                  >
                    <img
                      loading="lazy"
                      src={item.coverImg}
                      alt={item.title}
                      onClick={() => handleNavigation(item.id)}
                      className="w-14 h-9 sm:w-20 sm:h-12 object-cover object-top rounded-md sm:rounded-lg opacity-90 cursor-pointer hover:opacity-100 transition-opacity"
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
                      <LedgerAction 
                        isActive={inLedger}
                        onClick={() => handleAddToLedger(item.id)}
                        variant="feed"
                      />
                      <button
                        onClick={() => handleTagToLedger(item.id)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all ${isTagged ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/50 hover:bg-white/10"}`}
                        title="Tag work to Ledger"
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
