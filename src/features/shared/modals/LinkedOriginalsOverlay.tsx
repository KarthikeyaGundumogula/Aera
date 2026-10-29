import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LedgerAction } from "../../../components/actions/LedgerAction";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { LinkedOriginal } from "../../../types";

export interface LinkedOriginalsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  originals: LinkedOriginal[];
  workId?: string | number;
  isLoading?: boolean;
  onShowToast: (msg: string) => void;
}

export function LinkedOriginalsOverlay({
  isOpen,
  onClose,
  originals,
  workId: _workId,
  isLoading = false,
  onShowToast,
}: LinkedOriginalsOverlayProps) {
  const navigate = useNavigate();
  const { currentArtist } = useAuth();
  // Map of originalId -> libraryEntryId
  const [libraryEntryMap, setLibraryEntryMap] = useState<Record<string, string>>({});

  // Pre-load user's library entries if logged in
  useEffect(() => {
    if (isOpen && currentArtist) {
      apiFetch("/library")
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const items = json.data ?? [];
            if (Array.isArray(items)) {
              const map: Record<string, string> = {};
              for (const e of items) {
                const origId = e.id || e.originalId;
                const entryId = e.libraryEntryId || e.id;
                if (origId) {
                  map[origId] = String(entryId);
                }
              }
              setLibraryEntryMap(map);
            }
          }
        })
        .catch(() => undefined);
    }
  }, [isOpen, currentArtist]);

  const handleAddToLedger = async (id: string) => {
    if (!currentArtist) {
      onShowToast("Sign in required to add to Library");
      return;
    }

    const existingEntryId = libraryEntryMap[id];

    try {
      if (existingEntryId) {
        const res = await apiFetch(`/library/${existingEntryId}/delete`, {
          method: "DELETE",
        });

        if (res.ok) {
          setLibraryEntryMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          onShowToast("Original Removed from Library");
        } else {
          onShowToast("Failed to remove from Library");
        }
      } else {
        const res = await apiFetch("/library/new", {
          method: "POST",
          body: JSON.stringify({
            original_id: id,
            visibility: true,
            status: "WANT_TO_WATCH",
            entry_type: "MOVIE",
            surge_score: 0,
          }),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          const newEntryId = json?.data?.id || json?.data || `lib-${Date.now()}`;
          setLibraryEntryMap((prev) => ({
            ...prev,
            [id]: String(newEntryId),
          }));
          onShowToast("Original Added to Library");
        } else {
          onShowToast("Failed to add to Library");
        }
      }
    } catch (err) {
      console.error("[LinkedOriginalsOverlay] Failed to update library status:", err);
      onShowToast("Network error updating Library");
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
                const inLedger = Boolean(libraryEntryMap[item.id]);

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
                    <div className="flex items-center pr-1 sm:pr-2">
                      <LedgerAction 
                        isActive={inLedger}
                        onClick={() => handleAddToLedger(item.id)}
                        variant="feed"
                      />
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

// Backward compatibility alias
export const CurateOverlay = LinkedOriginalsOverlay;
export type CurateOverlayProps = LinkedOriginalsOverlayProps;
