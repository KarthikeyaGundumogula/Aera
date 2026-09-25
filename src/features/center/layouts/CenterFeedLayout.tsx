import { motion, AnimatePresence } from "motion/react";
import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useDeferredValue,
} from "react";
import {
  Search,
  Loader2,
  History,
  Sun,
  ChevronRight,
  Users,
  Trophy,
  Youtube,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { TheatreItem, OriginalArtist, Festival } from "../../../types";
import { apiFetch } from "@/lib/api";
import { StageIcon } from "../../../components/icons/AppIcons";
import { TopOriginalsAccordion } from "../../originals/components/TopOriginalsAccordion";
import { SectionHeader } from "../../../components/SectionHeader";
import { OriginalLink } from "../../shared/work";
import { RollingTicker } from "../components/RollingTicker";
import { ArtistSpotlightGrid } from '../../../components/ArtistSpotlightGrid';
import { ContactCTA } from "../components/ContactCTA";
import { CenterQuotes } from "../components/CenterQuotes";
import { HomePageSkeleton } from "../components/HomePageSkeleton";
import { RecentReleasesSection } from "../../shared/components/RecentReleasesSection";
import { TrendingDiscussions } from "../components/TrendingDiscussions";
import { MobileTopHeader } from "../../navigation/MobileTopHeader";
import { DesktopHeader } from "../../navigation/DesktopHeader";
import { FestivalsSection } from "../../hall/components/FestivalsSection";

export function CenterFeedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<TheatreItem[] | null>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [heroOriginals, setHeroOriginals] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);

  const SLIDE_DURATION = 5000;
  const PROGRESS_INTERVAL = 50;

  useEffect(() => {
    apiFetch("/theatre")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setItems(json.data ?? []);
        }
      })
      .catch((err) => {
        console.error("[CenterFeedLayout] Failed to fetch theatre items:", err);
      });
  }, []);

  useEffect(() => {
    apiFetch("/festivals")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setFestivals(json.data ?? []);
        }
      })
      .catch((err) => {
        console.error("[CenterFeedLayout] Failed to fetch festivals:", err);
      });
  }, []);

  useEffect(() => {
    apiFetch("/originals?limit=5")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const raw = (json.data ?? []).slice(0, 5);
          setHeroOriginals(raw);
        }
      })
      .catch((err) => {
        console.error("[CenterFeedLayout] Failed to fetch hero originals:", err);
      });
  }, []);

  const safeHeroItem = useMemo(() => {
    if (!heroOriginals || heroOriginals.length === 0) return null;
    const safeIdx = ((heroIndex % heroOriginals.length) + heroOriginals.length) % heroOriginals.length;
    return heroOriginals[safeIdx] || heroOriginals[0] || null;
  }, [heroOriginals, heroIndex]);

  useEffect(() => {
    if (!heroOriginals || heroOriginals.length === 0) return;
    setProgress(0);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / SLIDE_DURATION) * 100;

      if (newProgress >= 100) {
        setDirection(1);
        setHeroIndex((prev) => (prev + 1) % heroOriginals.length);
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_INTERVAL);

    return () => clearInterval(intervalId);
  }, [heroIndex, heroOriginals.length]);

  const handleIndicatorClick = (idx: number) => {
    if (idx === heroIndex) return;
    setDirection(idx > heroIndex ? 1 : -1);
    setHeroIndex(idx);
  };

  const theatreArtists: OriginalArtist[] = useMemo(() => {
    if (!items || items.length === 0) return [];
    const map = new Map<string, OriginalArtist>();
    for (const item of items) {
      if (item.artistId && !map.has(item.artistId)) {
        map.set(item.artistId, {
          id: item.artistId,
          name: item.artist || "Artist",
          image: item.artistAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.artist || "Artist")}`,
          spirit: 0,
          works: 1,
        } as OriginalArtist);
      }
    }
    return Array.from(map.values());
  }, [items]);

  if (!items) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="bg-surface-deep min-h-screen text-white pb-24">
      {/* Mobile Header */}
      <MobileTopHeader />

      {/* Desktop Header */}
      <DesktopHeader />

      <main className="pt-20 md:pt-24 px-0 w-full max-w-full overflow-x-hidden">
        {/* HERO - UPCOMING RELEASES / TOP 5 MOVIES CAROUSEL */}
        {safeHeroItem && (
          <section className="px-0 mb-0">
            <div className="relative h-[65vh] md:h-[80vh] overflow-hidden bg-black">
              {/* Background Color Glow */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={`bg-${heroIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    src={safeHeroItem.coverImage}
                    className="absolute inset-0 w-full h-full object-cover object-top blur-[72px] scale-125"
                  />
                </AnimatePresence>
              </div>

              <AnimatePresence mode="popLayout">
                <OriginalLink
                  key={heroIndex}
                  item={{
                    id: safeHeroItem.id,
                    originalIds: [safeHeroItem.id],
                    category: "Original",
                  }}
                  className="absolute inset-0 z-10"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="w-full h-full"
                  >
                    <img
                      loading="lazy"
                      src={safeHeroItem.coverImage}
                      className="w-full h-full object-cover object-top"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                            Original
                          </span>
                          <span className="px-2 py-0.5 bg-yellow-400/20 backdrop-blur-md text-yellow-400 text-[8px] font-bold uppercase tracking-widest rounded-sm border border-yellow-400/20">
                            Coming Soon
                          </span>
                        </div>
                        <h2
                          className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
                          style={{
                            fontSize: `clamp(2rem, ${Math.max(4, 12 - (safeHeroItem.title?.length || 10) * 0.3)}vw, 4rem)`,
                          }}
                        >
                          {safeHeroItem.title}
                        </h2>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 mb-1">
                              <StageIcon className="w-3 h-3 text-white/80" />
                              <span className="text-lg font-bold drop-shadow-2xl">
                                {safeHeroItem.presence ?? safeHeroItem.stats?.presence ?? 0}
                              </span>
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 drop-shadow-2xl">
                              Stage
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </OriginalLink>
              </AnimatePresence>

              {/* Carousel Indicators */}
              <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-3 z-40">
                {heroOriginals.map((_, idx: number) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndicatorClick(idx);
                    }}
                    className="group relative w-1 h-10 rounded-xl bg-white/10 overflow-hidden transition-all duration-300 hover:w-1.5 cursor-pointer"
                    aria-label={`Slide ${idx + 1}`}
                  >
                    <div className="relative w-full h-full">
                      {/* Previous bars: faded white */}
                      {idx < heroIndex && (
                        <div className="absolute inset-0 bg-white/30" />
                      )}
                      {/* Active progress bar: solid white animating */}
                      {idx === heroIndex && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-white"
                          style={{ height: `${progress}%` }}
                          transition={{ ease: "linear", duration: 0.05 }}
                        />
                      )}
                      {/* Future bars: remain bg-white/10 from parent */}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <RollingTicker />

        {/* RECENT RELEASES (THEATRE WORKS) */}
        {items && items.length > 0 && (
          <RecentReleasesSection works={items} icon={Youtube} />
        )}

        {/* TOP ARTISTS */}
        {theatreArtists.length > 0 && (
          <ArtistSpotlightGrid
            icon={Users}
            title="Top Artists"
            artists={theatreArtists}
            rows={2}
            variant="featured"
            containerClassName="mt-4 mb-4"
          />
        )}

        {/* CENTER QUOTES */}
        <CenterQuotes />

        {/* FESTIVALS */}
        {festivals.length > 0 && (
          <section className="mb-12">
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
            <FestivalsSection festivals={festivals} />
          </section>
        )}

        {/* TRENDING DISCUSSIONS */}
        <TrendingDiscussions />

        {/* EXPLORE ORIGINALS */}
        <section className="mb-12">
          <SectionHeader
            icon={Sun}
            title="Originals"
            containerClassName="px-6 md:px-12 mb-6"
            actionNode={
              <button
                onClick={() => navigate("/originals")}
                className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                //Explore Archive
              </button>
            }
          />
          <TopOriginalsAccordion navigate={navigate} />
        </section>

        <section className="px-0 mb-12 mt-16">
          <ContactCTA />
        </section>
      </main>
    </div>
  );
}
