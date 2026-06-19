import { useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Film, BookOpen, Trophy, MessageSquare, Clapperboard, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  GRID_ITEMS,
  ORIGINALS,
  FESTIVALS,
  THOUGHTS_MOCK,
  CURRENT_USER_MOCK,
} from "../../mock";
import { mockLedger } from "../../mock/ledger";
import { MOCK_RECOMMENDATIONS } from "../../mock/recommendations";

import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { SectionHeader } from "../../components/SectionHeader";
import { HorizontalClusterSection } from "./components/HorizontalClusterSection";
import { FestivalsZone } from "./components/FestivalsZone";
import { DiscussionsZone } from "./components/DiscussionsZone";
import { RecommendationsZone } from "./components/RecommendationsZone";
import { LedgerTabsZone } from "./components/LedgerTabsZone";
import { YoutubeReleasesZone } from "./components/YoutubeReleasesZone";
import { OriginalSpotlightZone } from "./components/OriginalSpotlightZone";
import { ArtistRecommendationsZone } from "./components/ArtistRecommendationsZone";

/**
 * Hall — The app's personalized curation for the user.
 *
 * Not a generic feed — a series of cinematic scenes the user steps into.
 * Works cluster is the hero at the top. Everything below is contextual.
 */
export default function HallPage() {
  const navigate = useNavigate();

  // ── Scroll anchor refs ───────────────────────────────────────────────
  const originalsRef = useRef<HTMLElement>(null);
  const festivalsRef = useRef<HTMLElement>(null);
  const recommendationsRef = useRef<HTMLElement>(null);
  const ledgerRef = useRef<HTMLElement>(null);

  // ── Works from Favorited Originals ────────────────────────────────────────
  const favIds = useMemo(
    () => new Set(CURRENT_USER_MOCK.favoritedOriginalIds),
    []
  );

  const favoritedWorks = useMemo(
    () => GRID_ITEMS.filter((item) => item.originalIds?.some((id) => favIds.has(id))),
    [favIds]
  );

  const favoritedOriginals = useMemo(
    () => ORIGINALS.filter((o) => favIds.has(o.id)),
    [favIds]
  );

  // ── Ledger ────────────────────────────────────────────────────────────────
  const ledgerItems = useMemo(() => mockLedger, []);

  // ── Festivals from member Sets ────────────────────────────────────────────
  const memberSetIds = useMemo(
    () => new Set(CURRENT_USER_MOCK.memberSetIds),
    []
  );

  const memberFestivals = useMemo(
    () =>
      FESTIVALS.filter((f) => memberSetIds.has(f.setId)).sort((a, b) => {
        const order = { LIVE: 0, UPCOMING: 1, CONCLUDED: 2 };
        return (
          (order[a.status as keyof typeof order] ?? 2) -
          (order[b.status as keyof typeof order] ?? 2)
        );
      }),
    [memberSetIds]
  );

  const liveFestivals = memberFestivals.filter((f) => f.status === "LIVE");

  // ── Discussions from member Sets ──────────────────────────────────────────
  const memberDiscussions = useMemo(
    () => THOUGHTS_MOCK.filter((t) => t.setId && memberSetIds.has(t.setId)),
    [memberSetIds]
  );

  return (
    <div className="min-h-screen bg-surface-deep text-white pb-28">
      <MobileTopHeader />
      <DesktopHeader />

      <main className="pt-[61px]">

        {/* ══════════════════════════════════════════════════════
            HERO — Identity + Live stats
        ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden px-6 md:px-12 pt-10 pb-10">
          {/* Ambient background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-40 bg-white/[0.012] rounded-full blur-[80px]" />
            <div className="absolute top-4 right-1/3 w-64 h-28 bg-white/[0.008] rounded-full blur-[60px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Welcome back, Karthikeya
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-5 max-w-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30">
              The stage is yours.
            </h1>
            <p className="text-[12px] text-white/40 font-light leading-relaxed max-w-md">
              Your personalized curated sets and the latest discussions are ready. Dive back into the narrative and shape your legacy.
            </p>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="relative flex items-center gap-3 mt-6 flex-wrap"
          >
            <button 
              onClick={() => originalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            >
              <Film className="w-3 h-3 text-white/35" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                {favoritedOriginals.length} Originals
              </span>
            </button>

            {liveFestivals.length > 0 && (
              <button
                onClick={() => festivalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/15 transition-all cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  {liveFestivals.length} Live Festival{liveFestivals.length !== 1 ? "s" : ""}
                </span>
              </button>
            )}

            {MOCK_RECOMMENDATIONS?.length > 0 && (
              <button 
                onClick={() => recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
              >
                <Sparkles className="w-3 h-3 text-white/35" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                  {MOCK_RECOMMENDATIONS.length} Recommendations
                </span>
              </button>
            )}
            
            <button 
              onClick={() => ledgerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            >
              <BookOpen className="w-3 h-3 text-white/35" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">
                {ledgerItems.length} Ledger
              </span>
            </button>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            NEW SCENE — ARTIST RECOMMENDATIONS
        ══════════════════════════════════════════════════════ */}
        <motion.section
          ref={recommendationsRef}
          id="section-recommendations"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 scroll-mt-24"
        >
          <ArtistRecommendationsZone />
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            SCENE 1 — FESTIVALS IN YOUR SETS
        ══════════════════════════════════════════════════════ */}
        {memberFestivals.length > 0 && (
          <motion.section
            ref={festivalsRef}
            id="section-festivals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 scroll-mt-24"
          >
            <div className="px-6 md:px-12 mb-5 flex items-center justify-between">
              <SectionHeader icon={Trophy} title="Festivals" containerClassName="opacity-100" />
              <button
                onClick={() => navigate("/sets")}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors"
              >
                All Sets <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <FestivalsZone festivals={memberFestivals} />
          </motion.section>
        )}

        {/* ══════════════════════════════════════════════════════
            SCENE 2 — THIS WEEK'S RECOMMENDATIONS
        ══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <RecommendationsZone />
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            SCENE 3 — DISCUSSIONS IN YOUR SETS
        ══════════════════════════════════════════════════════ */}
        {memberDiscussions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <SectionHeader
              icon={MessageSquare}
              title="Discussions"
              containerClassName="px-6 md:px-12 mb-5 opacity-100"
            />
            <DiscussionsZone thoughts={memberDiscussions} />
          </motion.section>
        )}

        {/* ══════════════════════════════════════════════════════
            SCENE 4 — YOUR LEDGER
        ══════════════════════════════════════════════════════ */}
        <motion.section
          ref={ledgerRef}
          id="section-ledger"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 scroll-mt-24"
        >
          <LedgerTabsZone />
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            SCENE 5 — TOP RELEASES THIS WEEK
        ══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <YoutubeReleasesZone />
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            SCENE 6 — ORIGINAL SPOTLIGHT FEED
        ══════════════════════════════════════════════════════ */}
        {ORIGINALS.slice(0, 4).map((original, idx) => (
          <motion.section
            ref={idx === 0 ? originalsRef : undefined}
            id={idx === 0 ? "section-originals" : undefined}
            key={`spotlight-${original.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (idx * 0.05), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`mb-10 ${idx === 0 ? "scroll-mt-24" : ""}`}
          >
            <OriginalSpotlightZone 
              original={original} 
              works={GRID_ITEMS.filter(w => w.category === "Edit").slice(0, 10)} 
            />
          </motion.section>
        ))}

        {/* Empty state */}
        {!favoritedWorks.length &&
          !ledgerItems.length &&
          !memberFestivals.length &&
          !memberDiscussions.length && (
            <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/15 mb-3">
                Your hall is empty
              </p>
              <p className="text-[11px] text-white/15 font-mono max-w-xs leading-relaxed">
                Favorite Originals, join Sets, and fill your Ledger to unlock
                your curation.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
