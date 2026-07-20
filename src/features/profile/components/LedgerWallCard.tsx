/**
 * LedgerWallCard.tsx
 *
 * Wall preview card for a LEDGER_ENTRY post.
 *
 * Design: editorial "newspaper clipping" aesthetic.
 *   ┌─────────────────────────────────────────┐
 *   │ [poster — left strip] │ ORIGINAL NAME   │
 *   │                       │ pre-thoughts or │
 *   │                       │ "Logged after"  │
 *   │                       ├─────────────────┤
 *   │                       │ post snippet    │
 *   │                       │                 │
 *   │                       ├─────────────────┤
 *   │                       │ SURGE ●●●●●     │
 *   └─────────────────────────────────────────┘
 *
 * Tapping navigates to /ledger/:id (LedgerViewer).
 */

import React, { memo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookPlus, ChevronRight } from "lucide-react";
import { LedgerItem } from "../../../mock/ledger";
import { WallPost } from "../../../types/wall";
import { SurgeBars } from "../../../components/SurgeBars";

interface LedgerWallCardProps {
  post: WallPost;
  entry: LedgerItem;
  /** When true (Hall context): card is a peek — show explicit "View Entry" button, no tap nav */
  previewOnly?: boolean;
  onClick?: () => void;
}

function formatScore(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export const LedgerWallCard = memo<LedgerWallCardProps>(
  ({ post, entry, previewOnly = false, onClick }) => {
    const navigate = useNavigate();
    const isWatched = entry.status === "watched";

    const handleTap = () => {
      // Only navigate directly when NOT in preview-only (Hall) mode
      if (!previewOnly) {
        if (onClick) onClick();
        navigate(`/ledger/${entry.id}`);
      }
    };

    const card = (
      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={previewOnly ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        onClick={previewOnly ? undefined : handleTap}
        className={`
          relative select-none overflow-hidden
          flex flex-col
          rounded-xl border border-white/[0.07] bg-[#0d0d0d]
          hover:border-white/[0.15] transition-colors duration-200
          ${previewOnly ? "cursor-default" : "cursor-pointer"}
        `}
        role="article"
        aria-label={`Ledger entry for ${entry.originalName} by ${post.artistName}`}
      >
        {/* Main row: poster + text */}
        <div className="flex flex-1">
        <div className="relative flex-shrink-0 w-[90px] sm:w-[110px] overflow-hidden">
          <img
            src={entry.originalPosterUrl}
            alt={entry.originalName}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/70" />

          {/* Status badge overlaid at bottom */}
          <div className="absolute bottom-2 left-2">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border text-[7px] font-black uppercase tracking-widest ${
                isWatched
                  ? "bg-emerald-400/15 border-emerald-400/20 text-emerald-400"
                  : "bg-amber-400/15 border-amber-400/20 text-amber-400"
              }`}
            >
              {isWatched ? (
                <Eye className="w-2 h-2" />
              ) : (
                <EyeOff className="w-2 h-2" />
              )}
              {isWatched ? "Seen" : "Hype"}
            </span>
          </div>
        </div>

        {/* Right: editorial text column */}
        <div className="flex flex-col flex-1 min-w-0 p-3.5 sm:p-4 gap-2.5">
          {/* Original title + ledger icon */}
          <div className="flex items-start justify-between gap-2">
            <div>
              {entry.genre && entry.genre.length > 0 && (
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-white/25 mb-0.5">
                  {entry.genre[0]}
                </p>
              )}
              <h3 className="text-[13px] font-black uppercase tracking-tight text-white leading-tight">
                {entry.originalName}
              </h3>
              {entry.releaseYear && (
                <p className="text-[8px] font-medium text-white/30 mt-0.5">
                  {entry.releaseYear}
                </p>
              )}
            </div>
            <BookPlus className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5" />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Pre-thoughts excerpt OR "Logged after watching" label */}
          {entry.preThoughts ? (
            <p className="text-[11px] font-medium italic text-white/40 leading-snug">
              "{entry.preThoughts}"
            </p>
          ) : (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
              Logged after watching
            </p>
          )}

          {/* Post-experience excerpt */}
          {entry.afterThoughts && (
            <p className="text-[12px] font-medium text-white/75 leading-snug">
              {entry.afterThoughts}
            </p>
          )}

          {/* Divider + Surge block */}
          {entry.surgeScore && (
            <>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[17px] font-black leading-none tracking-tighter"
                    style={{
                      background:
                        "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #FBBF24 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {Math.min(Math.round((entry.surgeScore / 10000) * 100), 100)}%
                  </span>
                  <span className="text-[9px] font-bold text-white/40 tracking-tight font-mono">
                    {entry.surgeScore.toLocaleString()} / 10,000
                  </span>
                </div>
                <SurgeBars
                  score={entry.surgeScore}
                  highestScore={10000}
                  colorVariant="amber"
                  size="sm"
                />
              </div>
            </>
          )}
        </div>
        </div>{/* close main row */}

        {/* View Entry button — only shown in previewOnly (Hall) mode */}
        {previewOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/ledger/${entry.id}`); }}
            className="
              flex items-center justify-between w-full
              px-3.5 py-2.5 mt-0
              border-t border-white/[0.06]
              text-[9px] font-black uppercase tracking-[0.2em]
              text-white/30 hover:text-amber-400
              hover:bg-white/[0.02]
              transition-colors duration-150
            "
          >
            <span>View full entry</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );


    return (
      <div className="px-4 py-2">
        {card}
      </div>
    );
  }
);

LedgerWallCard.displayName = "LedgerWallCard";
