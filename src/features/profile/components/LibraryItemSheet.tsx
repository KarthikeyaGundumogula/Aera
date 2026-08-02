import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, Clock, Edit3, Check, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { CURRENT_USER_MOCK, GRID_ITEMS, ORIGINALS } from "../../../mock";
import { mockLedger, LedgerItem } from "../../../mock/ledger";
import { MOCK_RECOMMENDATIONS, Recommendation } from "../../../mock/recommendations";
import { SurgeBars } from "../../../components/SurgeBars";
import { TaggedWorksModal } from "../../../components/TaggedWorksModal";

interface LibraryItemSheetProps {
  originalId: string;
  profileId: string;
  onClose: () => void;
}

export function LibraryItemSheet({ originalId, profileId, onClose }: LibraryItemSheetProps) {
  const navigate = useNavigate();
  const [showTaggedWorksModal, setShowTaggedWorksModal] = useState(false);

  const initialEntry = mockLedger.find(
    (l) =>
      l.originalId === originalId &&
      (l.artistId === profileId || (!l.artistId && (profileId === "fh-001" || profileId === CURRENT_USER_MOCK.id)))
  );
  const original = ORIGINALS.find((o) => o.id === originalId);

  const recommendation = MOCK_RECOMMENDATIONS.find(
    (r: Recommendation) => r.original.id === originalId && r.artist.id === profileId
  );

  const works = GRID_ITEMS.filter((w) => w.originalIds?.includes(originalId));

  const [entryStatus, setEntryStatus] = useState<"watched" | "want_to_watch">(
    initialEntry?.status ?? "watched"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [surgeScore, setSurgeScore] = useState<number>(
    initialEntry?.surgeScore ?? 7500
  );
  const [preThoughts, setPreThoughts] = useState<string>(
    initialEntry?.preThoughts ?? ""
  );
  const [afterThoughts, setAfterThoughts] = useState<string>(
    initialEntry?.afterThoughts ?? ""
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isOwner = (profileId === CURRENT_USER_MOCK.id || profileId === "fh-001");
  const peakMagnitude = original?.resonanceSignature?.peakMagnitude || 10000;
  const pctScore = Math.min(Math.round((surgeScore / peakMagnitude) * 100), 100);

  const handleStatusChange = (newStatus: "watched" | "want_to_watch") => {
    setEntryStatus(newStatus);
    if (initialEntry) {
      initialEntry.status = newStatus;
      if (newStatus === "watched" && !initialEntry.watchedAt) {
        initialEntry.watchedAt = new Date().toISOString();
      }
    }
  };

  const handleOpenFullViewer = (openEdit = false) => {
    onClose();
    if (initialEntry) {
      navigate(`/ledger/${initialEntry.id}${openEdit ? "?edit=true" : ""}`);
    } else if (original) {
      const newId = `wl_${Date.now()}`;
      mockLedger.push({
        id: newId,
        artistId: profileId,
        originalId: original.id,
        originalName: original.title,
        originalPosterUrl: original.coverImage || "",
        releaseYear: original.releaseDate,
        genre: original.genre,
        status: entryStatus,
        taggedWorks: [],
        addedAt: new Date().toISOString(),
        watchedAt: entryStatus === "watched" ? new Date().toISOString() : undefined,
      });
      navigate(`/ledger/${newId}${openEdit ? "?edit=true" : ""}`);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0F0E0C] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
      >
        {/* Top Handle / Close Bar */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D97706]">
              Library Item Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {original ? (
          <>
            {/* Poster + Meta Row */}
            <div className="flex gap-4">
              <img
                src={original.coverImage}
                alt={original.title}
                className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white line-clamp-2">
                    {original.title}
                  </h2>
                  <p className="text-[10px] font-mono text-white/40 mt-1">
                    {original.releaseDate || "2024"} • {Array.isArray(original.genre) ? original.genre.join(", ") : original.genre}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Switcher Bar */}
            {isOwner && (
              <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-1 flex-1">
                  <button
                    onClick={() => handleStatusChange("watched")}
                    className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      entryStatus === "watched"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Watched
                  </button>
                  <button
                    onClick={() => handleStatusChange("want_to_watch")}
                    className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      entryStatus === "want_to_watch"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Plan to Watch
                  </button>
                </div>
              </div>
            )}

            {/* Display Area */}
            <div className="space-y-5">
              {entryStatus === "watched" ? (
                /* WATCHED DISPLAY */
                <div className="space-y-5">
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter"
                        style={{
                          background:
                            "linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #FBBF24 70%, #B45309 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {pctScore}%
                      </span>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">
                        {surgeScore.toLocaleString()} / {peakMagnitude.toLocaleString()}
                      </span>
                    </div>

                    <SurgeBars
                      score={surgeScore}
                      highestScore={peakMagnitude}
                      colorVariant="amber"
                      size="lg"
                    />
                  </div>

                  {/* Editorial Quote Block */}
                  {(afterThoughts || preThoughts || initialEntry?.afterThoughts || initialEntry?.preThoughts) && (
                    <button
                      onClick={() => handleOpenFullViewer(false)}
                      className="text-left w-full group cursor-pointer space-y-2 pt-1"
                    >
                      <p className="font-serif italic text-sm md:text-base text-white/85 leading-relaxed pl-3.5 border-l-2 border-[#D97706]/60 line-clamp-3 group-hover:text-white transition-colors">
                        "{afterThoughts || preThoughts || initialEntry?.afterThoughts || initialEntry?.preThoughts}"
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] group-hover:text-amber-400 pl-3.5 transition-colors flex items-center gap-1">
                        Read Full Breakdown <ArrowRight className="w-3 h-3" />
                      </p>
                    </button>
                  )}
                </div>
              ) : (
                /* PLAN TO WATCH DISPLAY */
                <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                      In Watchlist (Plan to Watch)
                    </span>
                  </div>

                  {preThoughts || initialEntry?.preThoughts ? (
                    <p className="text-xs text-white/70 italic leading-relaxed pl-3 border-l-2 border-amber-500/40">
                      "{preThoughts || initialEntry?.preThoughts}"
                    </p>
                  ) : (
                    <p className="text-xs text-white/40 italic">
                      Added to watchlist. Mark as watched to record your Surge score and write a breakdown.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Collection Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/tagged-works/${originalId || initialEntry?.originalId || "og-original"}`);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Check Collection ({(initialEntry?.taggedWorks || []).length || 3})
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Side-by-Side Action Pills */}
            <div className="pt-2 space-y-3">
              {(recommendation || works.length > 0) && (
                <div className="flex items-center gap-2">
                  {recommendation && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/profile/${profileId}/recommendations/${originalId}`);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-left flex justify-between items-center group cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#D97706] group-hover:text-amber-400 transition-colors">
                        Recommendations
                      </span>
                      <span className="text-white/40 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  )}

                  {works.length > 0 && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/works/${works[0].id}`);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-left flex justify-between items-center group cursor-pointer"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/80 group-hover:text-white transition-colors truncate">
                        My Works ({works.length})
                      </span>
                      <span className="text-white/40 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  )}
                </div>
              )}

              {/* Primary Hero Action Button */}
              <button
                onClick={() => handleOpenFullViewer(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <span>Update Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-white/40 text-sm">
            Item not found.
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

// Export alias for backward compatibility
export const MiniDossierSheet = LibraryItemSheet;
