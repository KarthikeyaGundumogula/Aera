import { useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  Film,
  BookOpen,
  Trophy,
  MessageSquare,
  Clapperboard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
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
import { WallsOfArtistsZone } from "./components/WallsOfArtistsZone";
import { TopOriginalsZone } from "./components/TopOriginalsZone";

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
    [],
  );

  const favoritedWorks = useMemo(
    () =>
      GRID_ITEMS.filter((item) =>
        item.originalIds?.some((id) => favIds.has(id)),
      ),
    [favIds],
  );

  const favoritedOriginals = useMemo(
    () => ORIGINALS.filter((o) => favIds.has(o.id)),
    [favIds],
  );

  // ── Ledger ────────────────────────────────────────────────────────────────
  const ledgerItems = useMemo(() => mockLedger, []);

  // ── Festivals from member Sets ────────────────────────────────────────────
  const memberSetIds = useMemo(
    () => new Set(CURRENT_USER_MOCK.memberSetIds),
    [],
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
    [memberSetIds],
  );

  const liveFestivals = memberFestivals.filter((f) => f.status === "LIVE");

  // ── Discussions from member Sets ──────────────────────────────────────────
  const memberDiscussions = useMemo(
    () => THOUGHTS_MOCK.filter((t) => t.setId && memberSetIds.has(t.setId)),
    [memberSetIds],
  );

  return (
    <div className="min-h-screen bg-surface-deep text-white pb-28">
      <MobileTopHeader />
      <DesktopHeader />

      <main className="pt-[61px]">
        {/* ══════════════════════════════════════════════════════
            HERO — Walls of Artists
        ══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <WallsOfArtistsZone />
        </motion.section>

        {/* ══════════════════════════════════════════════════════
            NEW SCENE — TALK OF THE WEEK ORIGINALS
        ══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <TopOriginalsZone />
        </motion.section>

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
            className="mb-6 scroll-mt-24"
          >
            <div className="px-6 md:px-12 mb-5 flex items-center justify-between">
              <SectionHeader
                icon={Trophy}
                title="Festivals"
                containerClassName="opacity-100"
              />
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
          className="mb-6"
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
            className="mb-6"
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
          className="mb-6 scroll-mt-24"
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
          className="mb-6"
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
            transition={{
              delay: 0.3 + idx * 0.05,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`mb-6 ${idx === 0 ? "scroll-mt-24" : ""}`}
          >
            <OriginalSpotlightZone
              original={original}
              works={GRID_ITEMS.filter((w) => w.category === "Edit").slice(
                0,
                10,
              )}
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
