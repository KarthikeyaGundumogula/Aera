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
import { TheatreItem } from "../../../types";
import { GRID_ITEMS, ORIGINALS, FESTIVALS } from "../../../mock";
import { StageIcon } from "../../../components/icons/AppIcons";
import { ProfileNav } from "../../../components/ProfileNav";


import { Logo } from "../../../components/Logo";
import { TopOriginalsAccordion } from "../../originals/components/TopOriginalsAccordion";
import { SectionHeader } from "../../../components/SectionHeader";
import { ArtistProfile } from "../../shared/profile";
import { buildClusters } from "../../theatre/engine/clusterBuilder";
import { StaticDesktopCluster } from "../../theatre/components/desktop/StaticDesktopCluster";
import {
  OriginalLink,
  EditWork,
  PosterWork,
  ScriptWork,
} from "../../shared/work";
import { getWorkKind } from "../../shared/work/types";
import { RollingTicker } from "../components/RollingTicker";
import { CategoryBadge } from '../../theatre/components/CategoryBadge';
import { ArtistSpotlightGrid } from '../../../components/ArtistSpotlightGrid';
import { CinematicPageHeader } from '../../../components/CinematicPageHeader';
import { ContactCTA } from "../components/ContactCTA";
import { HomePageSkeleton } from "../components/HomePageSkeleton";
import { RecentReleasesSection } from "../../shared/components/RecentReleasesSection";
import { TrendingDiscussions } from "../components/TrendingDiscussions";
import { GlobalSearch } from "../../../components/search/GlobalSearch";
import { FeedContext } from "../../../context/FeedContext";
import { MobileTopHeader } from "../../navigation/MobileTopHeader";
import { DesktopHeader } from "../../navigation/DesktopHeader";
import { FestivalsZone } from "../../hall/components/FestivalsZone";

// HomeFeedLayoutProps empty for now

const MobileFeedItem = memo(({ item }: { item: TheatreItem }) => {
  const kind = getWorkKind(item);
  return (
    <div className="w-full px-6">
      <div
        className="relative rounded-xl overflow-hidden border border-white/5 bg-white/5"
        style={{ aspectRatio: item.aspectRatio || 1 }}
      >
        {kind === "script" ? (
          <ScriptWork item={item} variant="theatre-mobile" />
        ) : kind === "poster" ? (
          <PosterWork item={item} variant="theatre-mobile" />
        ) : (
          <EditWork item={item} variant="theatre-mobile" />
        )}
      </div>
    </div>
  );
});

// Simulate a global store/cache
let cachedItems: TheatreItem[] | null = null;

export function CenterFeedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<TheatreItem[] | null>(cachedItems);

  useEffect(() => {
    if (!items) {
      // Simulate network request for data
      const timer = setTimeout(() => {
        cachedItems = [...GRID_ITEMS];
        setItems(cachedItems);
      }, 800); // Only runs when data is not cached
      return () => clearTimeout(timer);
    }
  }, [items]);

  // Defer heavy layout data so the hero/header paints immediately on mount
  const deferredItems = useDeferredValue(items || []);
  const desktopClusters = useMemo(
    () => buildClusters(deferredItems, "flow"),
    [deferredItems],
  );

  const desktopFlatItems = useMemo(
    () => desktopClusters.flatMap((c) => c.slots.map((s) => s.item).filter(Boolean) as TheatreItem[]),
    [desktopClusters]
  );

  const getNavItemClassName = (active: boolean) =>
    `flex min-w-0 flex-col items-center justify-center rounded-2xl px-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
      active
        ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
        : "text-white/45 hover:text-white"
    }`;

  const [heroIndex, setHeroIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoadingDown, setIsLoadingDown] = useState(false);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  const SLIDE_DURATION = 5000;
  const PROGRESS_INTERVAL = 50;

  // Timer logic: heroIndex is the single source of truth.
  // We use a time-based approach to ensure precision and prevent skipping.
  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / SLIDE_DURATION) * 100;

      if (newProgress >= 100) {
        setDirection(1);
        setHeroIndex((prev) => (prev + 1) % ORIGINALS.length);
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_INTERVAL);

    return () => clearInterval(intervalId);
  }, [heroIndex]);

  const handleIndicatorClick = (idx: number) => {
    if (idx === heroIndex) return;
    setDirection(idx > heroIndex ? 1 : -1);
    setHeroIndex(idx);
  };

  const loadMoreDown = useCallback(() => {
    if (isLoadingDown) return;
    setIsLoadingDown(true);

    setTimeout(() => {
      const nextItems = GRID_ITEMS.map((item) => ({
        ...item,
        id: `down-${Math.random()}`,
      }));
      setItems((prev) => prev ? [...prev, ...nextItems] : nextItems);
      setIsLoadingDown(false);
    }, 800);
  }, [isLoadingDown]);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreDown();
        }
      },
      { threshold: 0.1 },
    );

    if (bottomObserverTarget.current)
      bottomObserver.observe(bottomObserverTarget.current);

    return () => {
      bottomObserver.disconnect();
    };
  }, [loadMoreDown]);

  const deferredOriginals = useDeferredValue(ORIGINALS);

  const baseGlobalArtists = useMemo(
    () =>
      Array.from(
        new Map(
          deferredOriginals
            .flatMap((org) => org.topArtists)
            .map((a) => [a.id, a]),
        ).values(),
      ).sort((a, b) => b.spirit - a.spirit),
    [deferredOriginals],
  );

  const globalArtistStripItems = useMemo(
    () =>
      baseGlobalArtists.length > 0
        ? Array.from(
            { length: 10 },
            (_, index) => baseGlobalArtists[index % baseGlobalArtists.length],
          )
        : [],
    [baseGlobalArtists],
  );

  if (!items) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="bg-surface-deep min-h-screen text-white pb-24">
      {/* Mobile Header */}
      <MobileTopHeader />

      {/* Desktop Header */}
      <DesktopHeader />

      <main className="pt-[61px] px-0 w-full max-w-full overflow-x-hidden">
        {/* HERO - UPCOMING RELEASES */}
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
                  src={ORIGINALS[heroIndex].coverImage}
                  className="absolute inset-0 w-full h-full object-cover blur-[72px] scale-125"
                />
              </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout">
              <OriginalLink
                key={heroIndex}
                // Mock a TheatreItem format for the OriginalLink component
                item={{
                  id: ORIGINALS[heroIndex].id,
                  originalIds: [ORIGINALS[heroIndex].id],
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
                    src={ORIGINALS[heroIndex].coverImage}
                    className="w-full h-full object-cover"
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
                          fontSize: `clamp(2rem, ${Math.max(4, 12 - ORIGINALS[heroIndex].title.length * 0.3)}vw, 4rem)`,
                        }}
                      >
                        {ORIGINALS[heroIndex].title}
                      </h2>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 mb-1">
                            <StageIcon className="w-3 h-3 text-white/80" />
                            <span className="text-lg font-bold drop-shadow-2xl">
                              {ORIGINALS[heroIndex].stats.presence}
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
              {ORIGINALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIndicatorClick(idx);
                  }}
                  className="group relative w-1 h-10 rounded-full bg-white/10 overflow-hidden transition-all duration-300 hover:w-1.5"
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

        <RollingTicker />

        {/* RECENT RELEASES */}
        <RecentReleasesSection icon={Youtube} />

        {/* TOP ARTISTS */}
        <ArtistSpotlightGrid
          icon={Users}
          title="Top Artists"
          artists={globalArtistStripItems}
          rows={2}
          variant="featured"
          containerClassName="mt-4 mb-12"
        />

        {/* FESTIVALS */}
        <section className="mb-12">
          <SectionHeader
            icon={Trophy}
            title="Festivals"
            containerClassName="px-6 md:px-12 mb-6"
          />
          <FestivalsZone festivals={FESTIVALS} />
        </section>

        {/* TRENDING DISCUSSIONS */}
        <TrendingDiscussions />

        {/* TOP ORIGINALS */}
        <section className="mb-12">
          <SectionHeader
            icon={Sun}
            title="Originals"
            containerClassName="px-6 md:px-12 mb-6"
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
