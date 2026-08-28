import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Eye, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { SurgeScoreDisplay } from "../../../components/surge/SurgeScoreDisplay";
import { PosterImage } from "../../../components/PosterImage";
import { apiFetch } from "@/lib/api";

interface LibraryItemSheetProps {
  originalId: string;
  profileId: string;
  libraryEntryId?: string;
  originalData?: any;
  onClose: () => void;
}

export function LibraryItemSheet({ originalId, profileId, libraryEntryId, originalData, onClose }: LibraryItemSheetProps) {
  const navigate = useNavigate();
  const [original, setOriginal] = useState<any>(originalData || null);
  const [sheetDetail, setSheetDetail] = useState<any>(null);

  const [entryStatus, setEntryStatus] = useState<"watched" | "want_to_watch">("watched");
  const [surgeScore, setSurgeScore] = useState<number>(0);
  const [peakMagnitude, setPeakMagnitude] = useState<number>(1000);
  const [currentPeakScore, setCurrentPeakScore] = useState<number>(1000);
  const [preThoughts, setPreThoughts] = useState<string>("");
  const [afterThoughts, setAfterThoughts] = useState<string>("");
  const [creditedWorksCount, setCreditedWorksCount] = useState<number>(0);

  useEffect(() => {
    if (originalData) {
      setOriginal(originalData);
    } else if (originalId) {
      apiFetch(`/originals/${originalId}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            setOriginal(json.data || json);
          }
        })
        .catch(console.error);
    }
  }, [originalId, originalData]);

  useEffect(() => {
    if (!libraryEntryId && !originalId) return;
    const targetId = libraryEntryId || originalId;
    apiFetch(`/library/entry/${targetId}`)
      .then(async (res) => {
        if (!res.ok) {
          const sheetRes = await apiFetch(`/library/sheet/${targetId}`).catch(() => null);
          if (!sheetRes || !sheetRes.ok) return null;
          const sheetJson = await sheetRes.json().catch(() => ({}));
          return sheetJson.data || sheetJson;
        }
        const json = await res.json().catch(() => ({}));
        return json.data || json;
      })
      .then((data) => {
        if (!data) return;
        setSheetDetail(data);
        if (data.status) {
          const st = String(data.status).toLowerCase();
          setEntryStatus(st.includes("want") || st.includes("plan") ? "want_to_watch" : "watched");
        }
        if (typeof data.surgeScore === "number") setSurgeScore(data.surgeScore);
        else if (typeof data.surge_score === "number") setSurgeScore(data.surge_score);

        if (typeof data.peakSnapshot === "number") setPeakMagnitude(data.peakSnapshot);
        else if (typeof data.peak_snapshot === "number") setPeakMagnitude(data.peak_snapshot);

        if (typeof data.currentPeakScore === "number") setCurrentPeakScore(data.currentPeakScore);
        else if (typeof data.current_peak_score === "number") setCurrentPeakScore(data.current_peak_score);

        if (data.userHypeThought) setPreThoughts(data.userHypeThought);
        else if (data.preThought) setPreThoughts(data.preThought);
        else if (data.pre_thought) setPreThoughts(data.pre_thought);

        if (data.userAfterThought) setAfterThoughts(data.userAfterThought);
        else if (data.postImpression) setAfterThoughts(data.postImpression);
        else if (data.post_impression) setAfterThoughts(data.post_impression);

        if (typeof data.creditedWorksCount === "number") setCreditedWorksCount(data.creditedWorksCount);
        else if (typeof data.credited_works_count === "number") setCreditedWorksCount(data.credited_works_count);
      })
      .catch(console.error);
  }, [libraryEntryId, originalId]);

  const handleStatusChange = (newStatus: "watched" | "want_to_watch") => {
    setEntryStatus(newStatus);
    const targetId = libraryEntryId || originalId;
    if (!targetId) return;
    apiFetch(`/library/${targetId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(console.error);
  };

  const handleOpenFullViewer = () => {
    onClose();
    const entryIdToNavigate = sheetDetail?.id || libraryEntryId || originalId;
    if (entryIdToNavigate) {
      navigate(`/ledger/${entryIdToNavigate}`);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0c] border-t sm:border border-white/10 sm:rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            Library Dossier
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {original ? (
          <>
            {/* Poster + Meta Row */}
            <div className="flex gap-4">
              <PosterImage
                src={original.coverImage || original.cover_image || original.cover_img}
                alt={original.title}
                info={original.genre?.slice?.(0, 2)?.join?.(" • ")}
                className="w-20 sm:w-24 aspect-[2/3] object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white line-clamp-2">
                    {original.title}
                  </h2>
                  <p className="text-[10px] font-mono text-white/40 mt-1">
                    {(() => {
                      if (!original?.releaseDate && !original?.release_date) return "2026";
                      const raw = String(original.releaseDate || original.release_date).trim();
                      if (/^\d{4}$/.test(raw)) return raw;
                      const d = new Date(raw);
                      if (isNaN(d.getTime())) return raw;
                      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                    })()} • {Array.isArray(original.genre) ? original.genre.join(", ") : original.genre || "Drama"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Switcher Bar */}
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

            {/* Display Area */}
            <div className="space-y-5">
              {entryStatus === "watched" ? (
                /* WATCHED DISPLAY */
                <div className="space-y-5">
                  <div className="pt-1">
                    <SurgeScoreDisplay
                      surgeScore={surgeScore}
                      peakSnapshot={peakMagnitude}
                      currentPeakScore={currentPeakScore}
                      size="sm"
                    />
                  </div>

                  {/* Editorial Quote Block */}
                  <button
                    onClick={() => handleOpenFullViewer()}
                    className="text-left w-full group cursor-pointer space-y-2 pt-1"
                  >
                    <p className="font-serif italic text-sm md:text-base text-white/85 leading-relaxed pl-3.5 border-l-2 border-[#D97706]/60 line-clamp-3 group-hover:text-white transition-colors">
                      "{afterThoughts || preThoughts || original?.description || "No thought notes recorded yet for this entry."}"
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] group-hover:text-amber-400 pl-3.5 transition-colors flex items-center gap-1">
                      Read Full Breakdown <ArrowRight className="w-3 h-3" />
                    </p>
                  </button>
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

                  <p className="text-xs text-white/70 italic leading-relaxed pl-3 border-l-2 border-amber-500/40">
                    "{preThoughts || original?.description || "Added to watchlist. Mark as watched to record your Surge score and write a breakdown."}"
                  </p>
                </div>
              )}
            </div>

            {/* Collection Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  const targetOgId = originalId || sheetDetail?.originalId || libraryEntryId;
                  const queryArtist = profileId ? `?artistId=${profileId}` : "";
                  navigate(`/tagged-works/${targetOgId}${queryArtist}`);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Check Collection
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Side-by-Side Action Pills */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2">
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

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/works/${originalId}`);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all text-left flex justify-between items-center group cursor-pointer"
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/80 group-hover:text-white transition-colors truncate">
                    My Works ({creditedWorksCount})
                  </span>
                  <span className="text-white/40 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              {/* Primary Hero Action Button */}
              <button
                onClick={() => {
                  onClose();
                  navigate(`/originals/${originalId}`);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] cursor-pointer font-extrabold"
              >
                <span>View Original</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-white/40 text-sm">
            Item details loading...
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

// Export alias for backward compatibility
export const MiniDossierSheet = LibraryItemSheet;
