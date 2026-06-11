import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, BookOpen, Bookmark, Info, ChevronDown } from "lucide-react";
import { Recommendation } from "../../../mock/recommendations";
import { ArtistProfile } from "../../shared/profile/ArtistProfile";

interface Props {
  rec: Recommendation;
}

export function RecommendationCard({ rec }: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [inLedger, setInLedger] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  // Hardcode a placeholder if artist.highestScore doesn't exist
  const highestScore = (rec.artist as any).highestScore || 4500;
  const isHighestRated = rec.score >= highestScore;

  return (
    <div className="flex flex-col gap-2.5 shrink-0">
      {/* ── Above-card Header ── */}
      <div className="flex items-center justify-between px-1">
        {/* Format on Left */}
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/40 bg-white/[0.02]">
            {rec.original.format}
          </span>
        </div>
        {/* Genres on Right */}
        <div className="flex items-center gap-1.5 justify-end">
          {rec.original.genres.slice(0, 2).map((genre) => (
             <span key={genre} className="text-[7px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/40 bg-white/[0.02]">
               {genre}
             </span>
          ))}
        </div>
      </div>

      {/* ── The Card ── */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
        className="relative w-[320px] sm:w-[380px] rounded-2xl bg-[#080604] border border-white/[0.07] cursor-pointer flex flex-col group"
        style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)" }}
      >
      {/* ── Top Area: Cover Photo ── */}
      <motion.div 
         layout 
         transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
         className="relative h-[135px] shrink-0 overflow-hidden rounded-t-2xl bg-[#040302] group/poster cursor-pointer"
         onClick={(e) => {
           e.stopPropagation();
           navigate(`/originals/${rec.original.id}`);
         }}
      >
        <img
          src={rec.original.coverImage}
          alt={rec.original.title}
          className="w-full h-full object-cover object-top transition-[transform,filter] duration-700 group-hover/poster:scale-105 group-hover/poster:brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Context Label Badge with Pulsating Dot */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.1] bg-black/50 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B45309] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#B45309]" />
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/80">
            {rec.contextLabel}
          </span>
        </div>

        {/* Title Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <h3 
             className="text-[22px] font-black uppercase text-white tracking-tight leading-[1.05] drop-shadow-2xl line-clamp-3"
             style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}
          >
            {rec.original.title}
          </h3>
        </div>
      </motion.div>

      {/* ── Bottom Area: Layout & Notes ── */}
      <motion.div 
        layout 
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
        className="p-4 sm:p-5 flex flex-col gap-4"
      >
        
        {/* Two Columns: Score/Makers (Left) & Artist/Notes (Right) */}
        <div className="flex gap-4 sm:gap-5">
          
          {/* LEFT COLUMN: Score & Makers */}
          <div className="w-[28%] shrink-0 flex flex-col gap-5">
            {/* Recommendation Score */}
            <div 
              className="relative cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em]">Score</span>
                <Info className={`w-2.5 h-2.5 transition-colors ${showTooltip ? "text-amber-500" : "text-white/20"}`} />
              </div>
              
              <span 
                 className="text-3xl font-black text-white leading-none tracking-tighter block"
                 style={{ textShadow: "0 0 16px rgba(255,255,255,0.05)" }}
              >
                {rec.score.toString()}
              </span>

              {/* Highest Score Tag */}
              <div className="mt-2 mb-1">
                 {isHighestRated ? (
                    <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm inline-block leading-relaxed">
                       Highest Rated
                    </span>
                 ) : (
                    <div>
                       <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">Highest Given</p>
                       <p className="text-[8px] font-mono font-bold text-white/50">{highestScore}</p>
                    </div>
                 )}
              </div>

              {/* Score Tooltip */}
              <div 
                className={`absolute left-0 top-full mt-2 w-48 origin-top-left z-30 transition-all duration-200 pointer-events-none ${
                  showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <div className="bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(180,83,9,0.2)]">
                  <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                    How strongly the artist recommends this original.
                  </p>
                </div>
              </div>
            </div>

            {/* Makers Details (Reverted Sizes) */}
            <div className="flex flex-col gap-2.5">
               {rec.original.director && (
                  <div>
                     <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Director</p>
                     <p className="text-[10px] font-bold text-white/85 truncate">{rec.original.director}</p>
                  </div>
               )}
               {rec.original.dop && (
                  <div>
                     <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">DOP</p>
                     <p className="text-[10px] font-bold text-white/85 truncate">{rec.original.dop}</p>
                  </div>
               )}
            </div>
          </div>

          <div className="w-[1px] bg-white/[0.06] shrink-0" />

          {/* RIGHT COLUMN: Artist & Notes */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Maker Details (Recommending Artist) */}
            <div 
               className="flex items-center gap-2 min-w-0 hover:bg-white/[0.04] p-1.5 -ml-1.5 rounded-xl transition-colors cursor-pointer"
               onClick={(e) => {
                 e.stopPropagation();
                 setIsArtistModalOpen(true);
               }}
            >
              <img 
                 src={rec.artist.profilePicture} 
                 alt={rec.artist.name} 
                 className="w-8 h-8 rounded-full border border-white/[0.1] object-cover object-top shrink-0" 
              />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/85 truncate leading-none mb-1">
                  {rec.artist.name}
                </p>
                <p className="text-[9px] font-mono text-white/40 truncate leading-none">
                  {rec.artist.stageName}
                </p>
              </div>
            </div>

            {/* Notes (Line Clamped, explicit expansion) */}
            <motion.div 
              layout 
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
              className="relative mt-0.5"
            >
              <p 
                className="text-[13px] sm:text-[14px] text-white/60 leading-relaxed font-medium"
                style={{
                   display: "-webkit-box",
                   WebkitBoxOrient: "vertical",
                   WebkitLineClamp: notesExpanded ? "unset" : 4,
                   overflow: notesExpanded ? "visible" : "hidden",
                }}
              >
                {rec.notes}
              </p>
              {rec.notes.length > 90 && (
                 <div 
                   className="flex items-center gap-0.5 mt-2 text-[9px] font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-colors w-fit"
                   onClick={(e) => {
                     e.stopPropagation();
                     setNotesExpanded(!notesExpanded);
                   }}
                 >
                   <motion.span
                     animate={{ rotate: notesExpanded ? 180 : 0 }}
                     transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                   >
                     <ChevronDown className="w-3 h-3" />
                   </motion.span>
                   {notesExpanded ? "Less" : "More"}
                 </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Always-Visible Minimalist Actions ── */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }}
          className="flex items-center gap-1.5 pt-1 mt-1"
          onPointerDown={(e) => e.stopPropagation()} // Prevent card click triggers if any
        >
          <button
            onPointerDown={(e) => { e.preventDefault(); setBoosted(!boosted); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
              boosted
                ? "bg-[#B45309]/10 text-[#B45309] shadow-[0_0_14px_rgba(180,83,9,0.16)]"
                : "text-white/25 hover:text-white/75 hover:bg-white/[0.04]"
            }`}
          >
            <Zap className="w-3 h-3 shrink-0" />
            {boosted ? "Boosted" : "Boost"}
          </button>

          <button
            onPointerDown={(e) => { e.preventDefault(); setInLedger(!inLedger); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
              inLedger
                ? "text-white/90 bg-white/[0.08]"
                : "text-white/25 hover:text-white/75 hover:bg-white/[0.04]"
            }`}
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            {inLedger ? "In Ledger" : "Add"}
          </button>

          <button
            onPointerDown={(e) => { e.preventDefault(); setSaved(!saved); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] transition-all duration-200 ${
              saved
                ? "text-white/90 bg-white/[0.08]"
                : "text-white/25 hover:text-white/75 hover:bg-white/[0.04]"
            }`}
          >
            <Bookmark className="w-3 h-3 shrink-0" />
            {saved ? "Saved" : "Save"}
          </button>
        </motion.div>

      </motion.div>

      {/* Artist Profile Modal */}
      {isArtistModalOpen && (
        <ArtistProfile
          artist={{
            id: rec.artist.id,
            name: rec.artist.name,
            image: rec.artist.profilePicture,
            presence: rec.artist.presence,
            works: 0,
          }}
          onClose={() => setIsArtistModalOpen(false)}
          zIndex="z-[250]"
        />
      )}
    </motion.div>
    </div>
  );
}
