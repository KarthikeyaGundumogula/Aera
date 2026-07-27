import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, Clock, Edit3, Check, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { CURRENT_USER_MOCK, GRID_ITEMS, ORIGINALS } from "../../../mock";
import { mockLedger, LedgerItem } from "../../../mock/ledger";
import { MOCK_RECOMMENDATIONS, Recommendation } from "../../../mock/recommendations";
import { SurgeBars } from "../../../components/SurgeBars";

interface MiniDossierSheetProps {
  originalId: string;
  profileId: string;
  onClose: () => void;
}

export function MiniDossierSheet({ originalId, profileId, onClose }: MiniDossierSheetProps) {
  const navigate = useNavigate();

  const initialEntry = mockLedger.find(
    (l) =>
      l.originalId === originalId &&
      (l.artistId === profileId || (!l.artistId && (profileId === "fh-001" || profileId === CURRENT_USER_MOCK.id)))
  );
  const original = ORIGINALS.find((o) => o.id === originalId);

  const recommendation = MOCK_RECOMMENDATIONS.find(
    (r: Recommendation) => r.original.id === originalId && r.artist.id === profileId
  );

  const works = GRID_ITEMS.filter(
    (w) => w.originalIds?.includes(originalId) && w.artistId === profileId
  );

  // Local interactive state
  const [entryStatus, setEntryStatus] = useState<"watched" | "want_to_watch">(
    initialEntry?.status ?? "want_to_watch"
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
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md cursor-pointer"
      />
      
      {/* Sheet Container */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 z-[200] bg-[#0b0b0d] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          boxShadow: "0 -16px 56px rgba(0,0,0,0.95)",
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.02] to-transparent pointer-events-none" />

        {/* Top Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0 relative z-10">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* ── Title & Status Header ──────────────────────────────────────── */}
        <div className="px-6 pt-2 pb-4 flex items-center justify-between border-b border-white/[0.06] shrink-0 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={original?.coverImage || initialEntry?.originalPosterUrl || "/posters/rrr.jpeg"}
              alt={original?.title || initialEntry?.originalName || "Original"}
              className="w-11 h-15 rounded-xl object-cover object-top border border-white/10 flex-shrink-0 shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base font-black uppercase tracking-tight text-white truncate">
                  {original?.title || initialEntry?.originalName || "Original"}
                </h3>
                {(original?.releaseDate || initialEntry?.releaseYear) && (
                  <span className="text-[9px] font-mono text-white/30">
                    {original?.releaseDate || initialEntry?.releaseYear}
                  </span>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    entryStatus === "watched"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}
                >
                  {entryStatus === "watched" ? (
                    <>
                      <Eye className="w-2.5 h-2.5" />
                      WATCHED
                    </>
                  ) : (
                    <>
                      <Clock className="w-2.5 h-2.5" />
                      PLAN TO WATCH
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Main Content Area ───────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 relative z-10">
          
          {/* Status Switcher (for Owner) */}
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

          {/* ── Cinematic Dossier Display ────────────────────── */}
          <div className="space-y-5">
            {entryStatus === "watched" ? (
              /* WATCHED DISPLAY — Integrated Hero Gauge & Editorial Quote */
              <div className="space-y-5">
                {/* Score & Bars Header Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter"
                      style={{
                        background:
                          "linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #FBBF24 70%, #B45309 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 0 16px rgba(217,119,6,0.35))",
                      }}
                    >
                      {pctScore}%
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white/40 text-[10px] font-mono font-bold">
                        {surgeScore.toLocaleString()} / {peakMagnitude.toLocaleString()}
                      </span>
                      <span className="text-white/25 text-[7px] font-black uppercase tracking-[0.2em]">
                        Resonance Score
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center h-[36px]">
                    <SurgeBars
                      score={surgeScore}
                      highestScore={peakMagnitude}
                      colorVariant="amber"
                      size="lg"
                    />
                  </div>
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
                  <p className="text-xs text-white/40 font-medium">
                    You haven't logged your watch experience yet.
                  </p>
                )}

                {isOwner && (
                  <button
                    onClick={() => {
                      handleStatusChange("watched");
                    }}
                    className="w-full mt-2 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Mark as Watched & Add Breakdown
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Compact Side-by-Side Action Pills ────────────────────────── */}
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
              onClick={() => {
                onClose();
                navigate(`/originals/${originalId}`);
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-white text-black hover:bg-white/90 transition-all text-center flex justify-center items-center cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-white/5"
            >
              Enter Original Page
            </button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
