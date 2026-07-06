import { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Edit3,
  Check,
  X,
  Eye,
  Clock,
  MessageSquare,
} from "lucide-react";
import { AdaptiveTitle } from "../../../components/AdaptiveTitle";
import type { LibraryItem } from "../../../mock/library";
import { LibraryTaggedWorksStack } from "./LibraryTaggedWorksStack";

export const LibraryItemCard = memo(function LibraryItemCard({
  item,
  onUpdate,
}: {
  item: LibraryItem;
  onUpdate: (item: LibraryItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hypeText, setHypeText] = useState(item.hypeText);
  const [afterThoughts, setAfterThoughts] = useState(item.afterThoughts || "");
  const [status, setStatus] = useState(item.status);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      ...item,
      status,
      hypeText,
      afterThoughts: afterThoughts || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHypeText(item.hypeText);
    setAfterThoughts(item.afterThoughts || "");
    setStatus(item.status);
    setIsEditing(false);
  };

  return (
    <motion.div
      className="relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top Section (Horizontal Split) */}
      <div
        className="flex flex-row cursor-pointer items-start"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        {/* Left: Poster - Fixed Dimensions with no stretching/cropping */}
        <div className="w-24 sm:w-32 flex-shrink-0 relative bg-black/40 border-r border-white/5">
          <div className="aspect-[2/3] relative w-full overflow-hidden">
            <img
              loading="lazy"
              src={item.originalPosterUrl}
              alt={item.originalName}
              className="w-full h-full object-contain transition-transform duration-1000 opacity-90 group-hover:scale-105 group-hover:opacity-100"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Right: Info Area */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-start relative">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {!isEditing ? (
                  <>
                    {item.status === "want_to_watch" && (
                      <span className="px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-sm">
                        Pending
                      </span>
                    )}
                    {item.status === "watched" && (
                      <span className="px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] bg-white/5 text-white/40 border border-white/10 rounded-sm">
                        Watched
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 pl-1">
                    Modifying Entry
                  </div>
                )}
              </div>

              <AdaptiveTitle
                title={item.originalName}
                multiWordClass="text-2xl sm:text-4xl"
                singleWordClamp="clamp(1.5rem, 10vw, 3.5rem)"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <button
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setIsExpanded(true);
                  }}
                  title="Edit Thoughts"
                >
                  <Edit3 className="w-4 h-4 text-white/60" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-2.5 rounded-xl bg-white text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    onClick={handleSave}
                    title="Save Changes"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                    onClick={handleCancel}
                    title="Cancel Edit"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              )}

              <button
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <ChevronDown
                  className={`w-5 h-5 text-white/40 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          <div>
            {isEditing ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 pl-1 block mb-3">
                  Update Viewing Status
                </span>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 shadow-inner w-fit">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("want_to_watch");
                    }}
                    disabled={item.status === "watched"}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                      status === "want_to_watch"
                        ? "bg-white/10 text-white shadow-xl"
                        : "text-white/20 hover:text-white/40 disabled:opacity-10"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("watched");
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                      status === "watched"
                        ? "bg-white/10 text-white shadow-xl"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Watched
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white/60 font-medium leading-relaxed italic border-l border-white/10 pl-4 text-xs sm:text-sm max-w-2xl line-clamp-2 uppercase tracking-tight">
                {item.hypeText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Mode: Expectations */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 sm:px-7 sm:pb-7 border-t border-white/5 bg-white/[0.02]"
          >
            <div className="pt-5 space-y-2 relative group/field">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/40 pl-1 flex items-center gap-2">
                  <MessageSquare className="w-2.5 h-2.5" />
                  Expectations
                </span>
                <Edit3 className="w-2 h-2 text-white/20" />
              </div>
              <div className="relative">
                <textarea
                  value={hypeText}
                  onChange={(e) => setHypeText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-xs sm:text-sm text-white/90 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all min-h-[120px] resize-none placeholder:text-white/10 shadow-inner"
                  placeholder="Document your expectations..."
                />
                <div className="absolute top-4 right-4 opacity-10 group-focus-within:opacity-0 transition-opacity pointer-events-none">
                  <Edit3 className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accordion Expanded Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-white/5 bg-black/60 backdrop-blur-md"
          >
            <div className="p-4 sm:p-6 sm:pl-32 space-y-6">
              {status === "watched" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-white/40">
                      Post Experience
                    </span>
                    {isEditing && (
                      <Edit3 className="w-2.5 h-2.5 text-white/20" />
                    )}
                  </div>
                  {isEditing ? (
                    <div className="relative group/field">
                      <textarea
                        value={afterThoughts}
                        onChange={(e) => setAfterThoughts(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-sm text-white/70 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all min-h-[140px] resize-none shadow-inner"
                        placeholder="Document your experience after watching..."
                      />
                      <div className="absolute top-4 right-4 opacity-10 group-focus-within:opacity-0 transition-opacity pointer-events-none">
                        <Edit3 className="w-3 h-3" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                      {item.afterThoughts}
                    </p>
                  )}
                </motion.div>
              )}

              {item.taggedWorks.length > 0 && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                    Works Library
                  </div>
                  <LibraryTaggedWorksStack works={item.taggedWorks} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
