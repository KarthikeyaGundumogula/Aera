import React, {
  useMemo,
  memo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useDeferredValue,
} from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ARTISTS_MOCK,
  STARS_MOCK,
  MAKERS_MOCK,
  GRID_ITEMS,
  ORIGINALS,
} from "../../mock";
import {
  MOCK_RECOMMENDATIONS,
  Recommendation,
} from "../../mock/recommendations";
import { OriginalPosterCard } from "../originals/components/OriginalPosterCard";
import { FeedRecommendationCard } from "../../components/FeedRecommendationCard";
import { buildClusters } from "../theatre/engine/clusterBuilder";
import { buildMobileClusters } from "../theatre/engine/mobileClusterBuilder";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";
import { SectionHeader } from "../../components/SectionHeader";
import { Film, ArrowRight } from "lucide-react";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { ProfileHero } from "../shared/profile/ProfileHero";
import { WallFeed } from "./components/WallFeed";
import { getWallPostsByArtist } from "../../mock/wall";

const THEMES: Record<
  string,
  {
    bg: string;
    nameGradient: [string, string];
    grainOpacity: number;
  }
> = {
  "profile-pawan-kalyan": {
    bg: "#050505",
    nameGradient: ["#b91c1c", "#ef4444"],
    grainOpacity: 0.03,
  },
  "profile-ram-charan": {
    bg: "#050505",
    nameGradient: ["#737373", "#e5e5e5"],
    grainOpacity: 0.05,
  },
  "fh-001": {
    bg: "#0B0E14",
    nameGradient: ["#334155", "#64748b"],
    grainOpacity: 0.04,
  },
};

const DEFAULT_THEME = {
  bg: "#050505",
  nameGradient: ["#fac107", "#fac107"] as [string, string],
  grainOpacity: 0.03,
};

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-surface-deep overflow-hidden flex flex-col font-sans">
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
      </div>
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-surface-deep/95 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20">
        <div className="w-[80vw] h-64 bg-white/5 rounded-3xl animate-pulse mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const loadedProfiles = new Set<string>();

const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "THEATRE" | "WALL" | "LIBRARY" | "RECOMMENDATIONS"
  >("THEATRE");
  const deferredProfileId = useDeferredValue(profileId);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Tab orb tracking
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const [orbX, setOrbX] = useState<number | null>(null);

  // Skip skeleton if we already loaded this profile in the current session
  const [isInitialLoading, setIsInitialLoading] = useState(
    () => !(profileId && loadedProfiles.has(profileId)),
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure active tab center and update orb position.
  // Deps include isInitialLoading so it fires when the skeleton clears and
  // the actual tabs mount for the first time — not just on tab switches.
  useLayoutEffect(() => {
    if (isInitialLoading) return;
    const activeEl = tabRefs.current[activeTab];
    const row = tabsRowRef.current;
    if (!activeEl || !row) return;
    const rowRect = row.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setOrbX(elRect.left + elRect.width / 2 - rowRect.left);
  }, [activeTab, isInitialLoading]);

  // Re-measure on resize so the orb never drifts
  useEffect(() => {
    const onResize = () => {
      const activeEl = tabRefs.current[activeTab];
      const row = tabsRowRef.current;
      if (!activeEl || !row) return;
      const rowRect = row.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setOrbX(elRect.left + elRect.width / 2 - rowRect.left);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeTab]);

  useEffect(() => {
    if (!profileId) return;

    if (loadedProfiles.has(profileId)) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      loadedProfiles.add(profileId);
    }, 800);
    return () => clearTimeout(timer);
  }, [profileId]);

  const profile = useMemo(() => {
    if (!deferredProfileId) return null;

    const artist = ARTISTS_MOCK.find((p) => p.id === deferredProfileId);
    if (artist) {
      return {
        id: artist.id,
        name: artist.name,
        tagline: artist.bio || "Artist",
        image: artist.image,
        spirit: artist.spirit.toLocaleString(),
        favoritesCount: "18.4K",
        type: "ARTIST" as const,
        socials: artist.socials,
      };
    }

    const star = STARS_MOCK.find(
      (s) =>
        `profile-${s.actorName
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/\./g, "")}` === deferredProfileId,
    );
    if (star) {
      return {
        id: deferredProfileId,
        name: star.actorName,
        tagline: star.characterName,
        image: star.imageUrl,
        spirit: "2,480",
        favoritesCount: "142K",
        type: "STAR" as const,
        socials: {
          instagram: star.actorName.toLowerCase().replace(/ /g, ""),
          twitter: star.actorName.toLowerCase().replace(/ /g, ""),
        },
      };
    }

    const maker = MAKERS_MOCK.find(
      (m) =>
        `profile-${m.actorName
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/\./g, "")}` === deferredProfileId,
    );
    if (maker) {
      return {
        id: deferredProfileId,
        name: maker.actorName,
        tagline: maker.characterName,
        image: maker.imageUrl,
        spirit: "1,840",
        favoritesCount: "82K",
        type: "MAKER" as const,
        socials: {
          instagram: maker.actorName.toLowerCase().replace(/ /g, ""),
          twitter: maker.actorName.toLowerCase().replace(/ /g, ""),
        },
      };
    }

    return null;
  }, [deferredProfileId]);

  const theme = deferredProfileId
    ? THEMES[deferredProfileId] || DEFAULT_THEME
    : DEFAULT_THEME;

  const userWorks = useMemo(() => {
    if (!profile) return [];
    return GRID_ITEMS.filter((w) => w.artistId === profileId || !w.artistId);
  }, [profile, profileId]);

  if (isInitialLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white/20">
            Archive Not Found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
          >
            Return to Theatre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden flex flex-col font-sans"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-[90] pointer-events-none" />

      <header
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-6 transition-all duration-500 ${
          isScrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <Logo onClick={() => navigate("/")} showText={false} />
        <div className="flex items-center gap-8">
          <ProfileNav />
        </div>
      </header>

      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')`,
          opacity: theme.grainOpacity,
          mixBlendMode: "overlay",
        }}
      />

      {/* ─── PROFILE HERO ─── */}
      <ProfileHero
        name={profile.name}
        handle={profile.id.toUpperCase().replace("PROFILE-", "")}
        tagline={profile.tagline}
        image={profile.image}
        spirit={profile.spirit}
        favoritesCount={profile.favoritesCount}
        theme={theme}
        isFavorited={isFavorited}
        onFavorite={() => setIsFavorited(!isFavorited)}
        socials={profile.socials}
        className="pt-16 md:pt-32 pb-8"
      />

      {/* ─── TABS & CONTENT (Native Background) ─── */}
      <div className="relative z-20 w-full bg-surface-deep min-h-screen text-white">
        {/* ─── CINEMATIC PARTITION + TAB INDICATOR ─── */}
        {/*
          Tabs first, then the partition line at the bottom.
          The orb sits ON the bottom line like a stage footlight at floor level,
          shooting its glow UPWARD to illuminate the active tab from below.
          Colour: Theatre Amber (#D97706) — brand accent.
          Motion: spring physics so the orb feels weighted, not mechanical.
        */}
        <div ref={tabsRowRef} className="relative w-full">
          {/* Tab buttons row — rendered FIRST so they sit above the line */}
          <div className="w-full flex justify-center pt-4 pb-3">
            <div className="flex items-center gap-8 md:gap-16">
              {(
                [
                  "THEATRE",
                  "WALL",
                  "LIBRARY",
                  "RECOMMENDATIONS",
                ] as ("THEATRE" | "WALL" | "LIBRARY" | "RECOMMENDATIONS")[]
              ).map((tab) => (
                <button
                  key={tab}
                  ref={(el) => {
                    tabRefs.current[tab] = el;
                  }}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${
                    activeTab === tab
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={{
                    textShadow:
                      activeTab === tab
                        ? `0 0 8px ${theme.nameGradient[0]}99, 0 0 16px ${theme.nameGradient[1]}4D`
                        : "none",
                    transition: "text-shadow 0.4s ease",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── LINE at the bottom of the tab zone ── */}
          <div
            className="w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)`,
            }}
          />

          {/* Footlight bloom — uses the profile's primary gradient color */}
          {orbX !== null && (
            <motion.div
              className="absolute pointer-events-none"
              animate={{ x: orbX - 80 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                bottom: "0px",
                width: "160px",
                height: "56px",
                background: `radial-gradient(ellipse at 50% 100%, ${theme.nameGradient[0]}40 0%, ${theme.nameGradient[0]}1A 40%, transparent 72%)`,
                filter: "blur(10px)",
                clipPath: "inset(-200px -200px 0px -200px)",
              }}
            />
          )}

          {/* Semi-sphere orb — uses the profile's primary gradient color */}
          {orbX !== null && (
            <motion.div
              className="absolute pointer-events-none"
              animate={{ x: orbX - 5 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                bottom: "0px",
                width: "10px",
                height: "5px",
                borderRadius: "5px 5px 0 0",
                background: `linear-gradient(to right, ${theme.nameGradient[0]}, ${theme.nameGradient[1]})`,
                boxShadow:
                  `0 0 5px 2px ${theme.nameGradient[0]}F2, 0 0 16px 6px ${theme.nameGradient[0]}BF, 0 0 36px 14px ${theme.nameGradient[0]}40`,
                clipPath: "inset(-200px -200px 0px -200px)",
              }}
            />
          )}
        </div>

        {/* ─── TAB CONTENT ─── */}
        <div className="w-full pt-0 pb-20">
          <section className="px-8 md:px-12">
            {activeTab === "THEATRE" && (
              <div className="mt-3">
                <UnifiedTheatre
                  works={userWorks}
                  variant="full"
                  disablePadding={true}
                />
              </div>
            )}

            {activeTab === "WALL" && (
              <div className="mt-4 -mx-8 md:mx-0">
                <WallFeed
                  posts={getWallPostsByArtist(profileId ?? "")}
                  themeGradient={theme.nameGradient}
                />
              </div>
            )}

            {activeTab === "LIBRARY" && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-4 md:gap-5 items-stretch mt-2">
                {ORIGINALS.map((original, index) => (
                  <OriginalPosterCard
                    key={original.id}
                    original={original}
                    makers={MAKERS_MOCK}
                    stars={STARS_MOCK}
                    index={index}
                  />
                ))}
              </div>
            )}

            {activeTab === "RECOMMENDATIONS" && (
              <div className="flex flex-col gap-12 max-w-2xl mx-auto mt-2">
                {MOCK_RECOMMENDATIONS.map((rec: Recommendation) => (
                  <FeedRecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
