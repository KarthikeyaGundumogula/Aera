import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, BookOpen, Bookmark, Info, ChevronDown, Heart, ArrowUpRight } from "lucide-react";
import { Recommendation } from "../mock/recommendations";
import { ArtistProfile } from "../features/shared/profile/ArtistProfile";

interface Props {
  rec: Recommendation;
  variant?: "default" | "modal";
}

export function RecommendationCard({ rec, variant = "default" }: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [inLedger, setInLedger] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favorited, setFavorited] = useState(rec.favorited ?? false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const highestScore = rec.artist.highestScore || 4500;
  const isHighestRated = rec.score >= highestScore;
  const ratio = rec.score / highestScore;

  return (
    <div className={`flex flex-col gap-1.5 shrink-0 ${variant === "modal" ? "w-full" : ""}`}>
      {/* ── Metadata Tags Row (Above Card) ── */}
      {variant === "default" && (
        <div className="flex items-center justify-between px-2">
        {/* Left: Format Tag */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 border border-white/30 px-3 py-1 rounded-full bg-white/[0.03] backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.03)]">
            {rec.original.format === "FEATURE" ? "Feature Film" : rec.original.format}
          </span>
        </div>

        {/* Right: Genre Tags */}
        <div className="flex items-center gap-1.5">
          {rec.original.genres.slice(0, 2).map((g) => (
            <span key={g} className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60 border border-white/20 px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-md">
              {g}
            </span>
          ))}
        </div>
      </div>
      )}

      {/* ── The Card ── */}
      <div
        className={
          variant === "default"
            ? "relative flex-1 h-[340px] w-[360px] sm:w-[440px] rounded-2xl bg-[#080604] border border-white/15 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]"
            : "relative w-full overflow-hidden"
        }
        style={
          variant === "default"
            ? { boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)" }
            : undefined
        }
      >
        {/* ── Horizontal Layout: Poster (Left) + Content (Right) ── */}
        <div className="flex h-full">

          {/* LEFT: Portrait Poster Column — presented as a cinematic standalone poster */}
          <div className="w-[130px] sm:w-[150px] shrink-0 flex flex-col bg-transparent relative z-10 h-full">
            {/* Poster — fixed height so tall images don't inflate card */}
            <div className="px-2.5 pt-2.5 pb-2 shrink-0">
              <div
                className="relative w-full h-[170px] overflow-hidden rounded-none border-2 border-white/30 cursor-pointer group/poster shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                onClick={(e) => { e.stopPropagation(); navigate(`/originals/${rec.original.id}`); }}
              >
                <img
                  src={rec.original.coverImage}
                  alt={rec.original.title}
                  className="w-full h-full object-cover object-top transition-[transform,filter] duration-700 group-hover/poster:scale-105 group-hover/poster:brightness-[0.6]" />
                {/* Gradient blend toward right */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050302]/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050302]/70 via-transparent to-transparent" />
              </div>
            </div>

            {/* Maker Credits + Stars */}
            <div className="px-2.5 pb-2.5 flex flex-col gap-1.5">
              {rec.original.director && (
                <div className="group/credit cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${rec.original.director}`); }}>
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">Dir.</p>
                  <div className="flex items-center gap-0.5">
                    <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/credit:text-white transition-colors">{rec.original.director}</p>
                    <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/credit:text-white/60 transition-colors shrink-0" />
                  </div>
                </div>
              )}
              {rec.original.dop && (
                <div className="group/credit cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${rec.original.dop}`); }}>
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">DOP</p>
                  <div className="flex items-center gap-0.5">
                    <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/credit:text-white transition-colors">{rec.original.dop}</p>
                    <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/credit:text-white/60 transition-colors shrink-0" />
                  </div>
                </div>
              )}
              {rec.original.stars && rec.original.stars.length > 0 && (
                <div>
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">Stars</p>
                  <div className="flex flex-col gap-1">
                    {rec.original.stars.slice(0, 3).map((star) => (
                      <div key={star} className="group/star flex items-center gap-0.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${star}`); }}>
                        <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/star:text-white transition-colors">{star}</p>
                        <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/star:text-white/60 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] bg-white/[0.05] shrink-0" />

          {/* RIGHT: Content Column */}
          <div className="flex-1 min-w-0 flex flex-col relative z-10">

            {/* TOP: Film Title */}
            <div
              className="px-3 pt-3 pb-2 cursor-pointer border-b border-white/[0.04]"
              onClick={(e) => { e.stopPropagation(); navigate(`/originals/${rec.original.id}`); }}
            >
              {isHighestRated && (
                <span className="inline-block text-[6px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm mb-1.5 leading-relaxed">
                  Highest Rated
                </span>
              )}
              <h3
                className="text-[17px] sm:text-[19px] font-black uppercase text-white tracking-tight leading-[1.05]"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
              >
                {rec.original.title}
              </h3>
            </div>

            {/* MIDDLE + FOOTER Container */}
            <div className="flex-1 relative flex flex-col min-h-0">
              
              {/* 1. GHOST STRUCTURE (Dictates exact frozen card height) */}
              <div className="opacity-0 pointer-events-none flex flex-col h-full" aria-hidden>
                {/* Notes Ghost */}
                <div className="px-3 py-2 shrink-0">
                  <p className="text-[13px] leading-relaxed font-medium" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 5, overflow: "hidden" }}>
                    {rec.notes}
                  </p>
                  {rec.notes.length > 90 && (
                    <div className="mt-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                      <ChevronDown className="w-3 h-3" /> MORE
                    </div>
                  )}
                </div>

                {/* Footer Ghost */}
                <div className="border-t border-transparent px-3 py-2 flex flex-col gap-2 shrink-0">
                  <div className="h-[28px] w-full" />
                  <div className="h-px w-full" />
                  <div className="h-[28px] w-full" />
                </div>
              </div>

              {/* 2. VISIBLE ANIMATED STRUCTURE */}
              <div className="absolute inset-0 overflow-hidden flex flex-col z-10">
                {/* Animated Notes */}
                <motion.div layout className="px-3 py-2 shrink-0 w-full relative z-20">
                  <motion.p
                    layout
                    className={`leading-relaxed font-medium transition-colors duration-300 text-white/85 ${
                      notesExpanded ? "text-[13px] sm:text-[14px]" : "text-[12px] sm:text-[13px]"
                    }`}
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: notesExpanded ? "unset" : 5,
                      overflow: "hidden",
                    }}
                  >
                    {rec.notes}
                  </motion.p>
                  {rec.notes.length > 90 && (
                    <motion.div
                      layout
                      className="mt-2 text-[8px] font-black uppercase tracking-widest text-amber-500/80 hover:text-amber-500 transition-colors w-fit cursor-pointer flex items-center gap-0.5"
                      onClick={(e) => { e.stopPropagation(); setNotesExpanded(!notesExpanded); }}
                    >
                      <motion.span animate={{ rotate: notesExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-3 h-3" />
                      </motion.span>
                      {notesExpanded ? "LESS" : "MORE"}
                    </motion.div>
                  )}
                </motion.div>

                {/* Animated Footer */}
                <motion.div
                  layout
                  animate={{ opacity: notesExpanded ? 0 : 1, filter: notesExpanded ? "blur(4px)" : "blur(0px)" }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="px-3 py-2 flex flex-col gap-2 shrink-0 border-t border-white/[0.04] w-full relative z-10 mt-auto"
                >
                    {/* Artist row: avatar + name + stats + artistLiked heart */}
                    <div className="flex items-center gap-2.5">
                {/* Artist Avatar — clickable */}
                <button
                  className="shrink-0 hover:opacity-80 transition-opacity focus:outline-none"
                  onClick={(e) => { e.stopPropagation(); setIsArtistModalOpen(true); }}
                >
                  <img
                    src={rec.artist.profilePicture}
                    alt={rec.artist.name}
                    className="w-7 h-7 rounded-lg border border-white/[0.1] object-cover object-top"
                  />
                </button>

                {/* Name + Stage Name + Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/85 leading-none truncate">
                      {rec.artist.name}
                    </span>
                    {/* Artist's own liked status on this original */}
                    {rec.artistLiked && (
                      <Heart
                        className="w-2.5 h-2.5 shrink-0"
                        style={{ fill: "#ef4444", color: "#ef4444", filter: "drop-shadow(0 0 4px rgba(239,68,68,0.4))" }}
                      />
                    )}
                    <span className="text-[8px] font-mono text-white/30 leading-none truncate">
                      {rec.artist.stageName}
                    </span>
                  </div>
                  {/* Artist stats */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[7px] font-black text-white/25 uppercase tracking-[0.15em]">
                      {rec.artist.presence.toLocaleString()} presence
                    </span>
                    {rec.artist.works != null && (
                      <>
                        <span className="text-[7px] text-white/15">·</span>
                        <span className="text-[7px] font-black text-white/25 uppercase tracking-[0.15em]">
                          {rec.artist.works} works
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Partition between artist info and score+user-favorite */}
              <div className="h-px bg-white/[0.05]" />

              {/* Score + Favorite Row — matched to 28px artist row height */}
              <div className="flex items-center gap-2.5 h-[28px]">

                {/* Bars block */}
                <div
                  className="relative flex items-center gap-2 flex-1 cursor-help min-w-0 h-full"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                >
                  {/* Bars */}
                  <div className="flex items-end gap-[2.5px] shrink-0 h-full">
                    {[0, 1, 2, 3, 4].map((i) => {
                      const chunkStart = i * 0.2;
                      const chunkEnd = (i + 1) * 0.2;
                      let fillPct = 0;
                      if (ratio >= chunkEnd) fillPct = 1;
                      else if (ratio > chunkStart) fillPct = (ratio - chunkStart) / 0.2;
                      // 9, 13.5, 18, 22.5, 27 — fits within 28px height perfectly
                      const maxHeight = 9 + i * 4.5;
                      return (
                        <div
                          key={i}
                          className="relative w-[4.5px] sm:w-[5px] rounded-[1px] bg-white/[0.06] overflow-hidden"
                          style={{ height: `${maxHeight}px` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 w-full rounded-[1px]"
                            style={{
                              height: `${fillPct * 100}%`,
                              backgroundColor: "#10B981",
                              boxShadow: fillPct === 1 ? `0 0 8px rgba(16,185,129,0.4)` : "none",
                            }}
                          />
                        </div>
                      );
                    })}
                    {rec.score > highestScore && (() => {
                      const overRatio = (rec.score - highestScore) / highestScore;
                      const fillPct = Math.min(overRatio / 0.2, 1);
                      const r = Math.round(217 + (255 - 217) * fillPct);
                      const g = Math.round(119 + (220 - 119) * fillPct);
                      const b = Math.round(6 + (100 - 6) * fillPct);
                      const barColor = `rgb(${r}, ${g}, ${b})`;
                      return (
                        <div
                          className="relative w-[4.5px] sm:w-[5px] rounded-[1px] bg-white/[0.06] ml-[1px] overflow-hidden"
                          style={{ height: "28px" }}
                        >
                          <div
                            className="absolute bottom-0 left-0 w-full rounded-[1px]"
                            style={{
                              height: `${fillPct * 100}%`,
                              backgroundColor: barColor,
                              boxShadow: `0 0 ${6 + fillPct * 8}px ${barColor}`,
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Score numbers */}
                  <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="text-[14px] font-black text-white leading-none tracking-tighter">
                      {rec.score.toLocaleString()}
                    </span>
                    <span className="text-[7px] font-black tracking-widest">
                      <span className="text-white/25">/ </span>
                      <span className="text-amber-500/80">{highestScore.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Info icon */}
                  <Info className={`w-3 h-3 shrink-0 transition-colors ${showTooltip ? "text-amber-500" : "text-white/15"}`} />

                  {/* Tooltip */}
                  <div
                    className={`absolute left-0 bottom-full mb-3 w-56 origin-bottom-left z-30 transition-all duration-150 ease-out pointer-events-none ${
                      showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"
                    }`}
                  >
                    <div className="bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(180,83,9,0.2)]">
                      <span className="text-white/40 font-black uppercase tracking-widest text-[7px] block mb-1">Personal Score</span>
                      <p className="text-[10px] text-white/75 leading-relaxed font-medium">
                        How strongly {rec.artist.name} recommends this — measured against their personal all-time peak.
                      </p>
                    </div>
                  </div>
                </div>



                {/* Vertical divider (Restored) */}
                <div className="w-px self-stretch bg-white/[0.07] shrink-0 mx-0.5" />

                {/* Original Favorite Heart */}
                <button
                  className="shrink-0 focus:outline-none p-1 rounded-lg hover:bg-white/[0.04] transition-all duration-150 ease-out active:scale-[0.97] flex items-center justify-center w-7 h-7 mr-3"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setFavorited((f) => !f); }}
                >
                  <motion.div
                    animate={{ scale: favorited ? [1, 1.3, 1] : 1 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  >
                    <Heart
                      className="w-5 h-5 transition-all duration-200"
                      style={{
                        fill: favorited ? "#ef4444" : "transparent",
                        color: favorited ? "#ef4444" : "rgba(255,255,255,0.18)",
                        filter: favorited ? "drop-shadow(0 0 8px rgba(239,68,68,0.55))" : "none",
                      }}
                    />
                  </motion.div>
                </button>

              </div>
                </motion.div>
              </div>
            </div>

            {/* ACTION ROW (At the very bottom, fixed in flow) */}
            <div className="shrink-0 px-3 pb-2 bg-[#080604] relative z-20">
              <div
                className={`flex items-center gap-1 pt-1 border-t transition-colors duration-300 ${!notesExpanded ? "border-white/[0.04]" : "border-transparent"}`}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  onPointerDown={(e) => { e.preventDefault(); setBoosted(!boosted); }}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
                    boosted
                      ? "bg-[#B45309]/10 text-[#B45309] shadow-[0_0_14px_rgba(180,83,9,0.16)]"
                      : "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
                  }`}
                >
                  <Zap className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill={boosted ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{boosted ? "Boosted" : "Boost"}</span>
                </button>

                <button
                  onPointerDown={(e) => { e.preventDefault(); setInLedger(!inLedger); }}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
                    inLedger
                      ? "text-white bg-white/[0.12]"
                      : "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
                  }`}
                >
                  <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill={inLedger ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{inLedger ? "Added" : "Add"}</span>
                </button>

                <button
                  onPointerDown={(e) => { e.preventDefault(); setSaved(!saved); }}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
                    saved
                      ? "text-white bg-white/[0.12]"
                      : "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
                  }`}
                >
                  <Bookmark className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill={saved ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Artist Profile Modal */}
      {isArtistModalOpen && (
        <ArtistProfile
          artist={{
            id: rec.artist.id,
            name: rec.artist.name,
            image: rec.artist.profilePicture,
            presence: rec.artist.presence,
            works: rec.artist.works ?? 0,
          }}
          onClose={() => setIsArtistModalOpen(false)}
          zIndex="z-[250]"
        />
      )}
    </div>
  );
}
