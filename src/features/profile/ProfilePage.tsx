import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useDeferredValue,
} from "react";
import { motion } from "motion/react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ARTISTS_MOCK,
  STARS_MOCK,
  MAKERS_MOCK,
  CURRENT_USER_MOCK,
  GRID_ITEMS,
  ORIGINALS,
} from "../../mock";
import { mockLedger } from "../../mock/ledger";
import { MOCK_RECOMMENDATIONS } from "../../mock/recommendations";
import { OriginalPosterCard } from "../originals/components/OriginalPosterCard";
import { MiniDossierSheet } from "./components/MiniDossierSheet";
import { AnimatePresence } from "motion/react";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";
import { EmptyState, EMPTY_PRESETS } from "../../components/EmptyState";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { ProfileHero } from "../shared/profile/ProfileHero";
import { WallFeed } from "./components/WallFeed";
import { getWallPostsByArtist } from "../../mock/wall";
import { useAuth, parseColorTheme } from "../../context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { TheatreItem } from "../../types";

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

interface ProfileDisplayData {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  image: string;
  spirit: string;
  favoritesCount: string;
  type: "ARTIST" | "STAR" | "MAKER";
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  colorTheme?: string;
}

const loadedProfiles = new Set<string>();

const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { currentArtist } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab")?.toUpperCase();
  const activeTab: "THEATRE" | "WALL" | "LIBRARY" = 
    (rawTab === "THEATRE" || rawTab === "WALL" || rawTab === "LIBRARY") 
      ? rawTab 
      : "THEATRE";

  const setActiveTab = (tab: "THEATRE" | "WALL" | "LIBRARY") => {
    setSearchParams({ tab: tab.toLowerCase() }, { replace: true });
  };
  const [dossierOriginalId, setDossierOriginalId] = useState<string | null>(null);
  const deferredProfileId = useDeferredValue(profileId);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const [backendProfile, setBackendProfile] = useState<ProfileDisplayData | null>(null);
  const [backendWorks, setBackendWorks] = useState<TheatreItem[]>([]);
  const [backendWallPosts, setBackendWallPosts] = useState<any[]>([]);

  // Tab orb tracking
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const [orbX, setOrbX] = useState<number | null>(null);

  // Initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (isInitialLoading) return;
    const activeEl = tabRefs.current[activeTab];
    const row = tabsRowRef.current;
    if (!activeEl || !row) return;
    const rowRect = row.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setOrbX(elRect.left + elRect.width / 2 - rowRect.left);
  }, [activeTab, isInitialLoading]);

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
    if (!profileId) {
      setIsInitialLoading(false);
      return;
    }

    let isMounted = true;
    const cleanHandle = profileId.replace(/^profile-/, "").toLowerCase();

    (async () => {
      setIsInitialLoading(true);

      // Check 1: If current logged-in user matches requested profile handle or ID
      if (
        currentArtist &&
        (currentArtist.name.toLowerCase() === cleanHandle ||
          currentArtist.id.toLowerCase() === profileId.toLowerCase() ||
          currentArtist.id.toLowerCase().includes(cleanHandle))
      ) {
        if (isMounted) {
          setBackendProfile({
            id: currentArtist.id,
            name: currentArtist.name,
            handle: cleanHandle,
            tagline: currentArtist.bio || "Visionary Artist",
            image: currentArtist.image || `boring-avatar:${cleanHandle}`,
            spirit: currentArtist.spirit.toLocaleString(),
            favoritesCount: "1.2K",
            type: "ARTIST",
            socials: currentArtist.socials,
            colorTheme: currentArtist.color_theme || `${currentArtist.themeTextColor || "#fac107"},${currentArtist.themeBgColor || "#0f1a42"}`,
          });
          setIsInitialLoading(false);
        }
        return;
      }

      // Check 2: Call backend GET /profiles/get_profile_details/{username}
      try {
        const res = await apiFetch(`/profiles/get_profile_details/${cleanHandle}`);
        if (res.ok) {
          const json = await res.json();
          const stage = json.artist_stage || json.data || json;
          if (stage && isMounted) {
            setBackendProfile({
              id: stage.id || profileId,
              name: stage.stageName || stage.userName || cleanHandle,
              handle: stage.userName || cleanHandle,
              tagline: stage.tagLine || "Visionary Artist",
              image: stage.profilePicture || `boring-avatar:${stage.userName || cleanHandle}`,
              spirit: (stage.spirit || 0).toLocaleString(),
              favoritesCount: "1.2K",
              type: "ARTIST",
              socials: {
                instagram: stage.instagramProfile || undefined,
                twitter: stage.twitterProfile || undefined,
                youtube: stage.youtubeProfile || undefined,
              },
              colorTheme: stage.colorTheme || "#fac107,#0f1a42",
            });
            setIsInitialLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend get_profile_details failed, trying mock fallbacks:", e);
      }

      // Check 3: Mock Fallback
      if (isMounted) {
        const artist = ARTISTS_MOCK.find(
          (p) => p.id.toLowerCase() === profileId.toLowerCase() || p.id.toLowerCase().includes(cleanHandle)
        );
        if (artist) {
          setBackendProfile({
            id: artist.id,
            name: artist.name,
            handle: artist.name.toLowerCase().replace(/ /g, "_"),
            tagline: artist.bio || "Artist",
            image: artist.image,
            spirit: artist.spirit.toLocaleString(),
            favoritesCount: "18.4K",
            type: "ARTIST",
            socials: artist.socials,
            colorTheme: `${artist.themeTextColor || "#fac107"},${artist.themeBgColor || "#0f1a42"}`,
          });
          setIsInitialLoading(false);
          return;
        }

        const star = STARS_MOCK.find(
          (s) =>
            `profile-${s.actorName.toLowerCase().replace(/ /g, "-").replace(/\./g, "")}` === profileId.toLowerCase() ||
            s.actorName.toLowerCase().includes(cleanHandle)
        );
        if (star) {
          setBackendProfile({
            id: profileId,
            name: star.actorName,
            handle: star.actorName.toLowerCase().replace(/ /g, "_"),
            tagline: star.characterName,
            image: star.imageUrl,
            spirit: "2,480",
            favoritesCount: "142K",
            type: "STAR",
            socials: {
              instagram: star.actorName.toLowerCase().replace(/ /g, ""),
              twitter: star.actorName.toLowerCase().replace(/ /g, ""),
            },
          });
          setIsInitialLoading(false);
          return;
        }

        const maker = MAKERS_MOCK.find(
          (m) =>
            `profile-${m.actorName.toLowerCase().replace(/ /g, "-").replace(/\./g, "")}` === profileId.toLowerCase() ||
            m.actorName.toLowerCase().includes(cleanHandle)
        );
        if (maker) {
          setBackendProfile({
            id: profileId,
            name: maker.actorName,
            handle: maker.actorName.toLowerCase().replace(/ /g, "_"),
            tagline: maker.characterName,
            image: maker.imageUrl,
            spirit: "1,840",
            favoritesCount: "82K",
            type: "MAKER",
            socials: {
              instagram: maker.actorName.toLowerCase().replace(/ /g, ""),
              twitter: maker.actorName.toLowerCase().replace(/ /g, ""),
            },
          });
          setIsInitialLoading(false);
          return;
        }

        setBackendProfile(null);
        setIsInitialLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [profileId, currentArtist]);

  useEffect(() => {
    if (!backendProfile?.id) return;
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(backendProfile.id);
    if (!isUuid) return;

    let isMounted = true;
    (async () => {
      try {
        if (activeTab === "THEATRE") {
          const res = await apiFetch(`/profiles/${backendProfile.id}/works?limit=12`);
          if (res.ok && isMounted) {
            const json = await res.json();
            const items = json.items || json.data || [];
            setBackendWorks(items);
          }
        } else if (activeTab === "WALL") {
          const res = await apiFetch(`/profiles/${backendProfile.id}/wall?limit=12`);
          if (res.ok && isMounted) {
            const json = await res.json();
            const items = json.items || json.data || [];
            setBackendWallPosts(items);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch paginated tab feed from backend:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [backendProfile?.id, activeTab]);

  const profile = backendProfile;

  const parsedTheme = useMemo(() => {
    if (profile?.colorTheme) {
      return parseColorTheme(profile.colorTheme);
    }
    const themeObj = profileId ? THEMES[profileId] || DEFAULT_THEME : DEFAULT_THEME;
    return { themeTextColor: themeObj.nameGradient[0], themeBgColor: themeObj.bg };
  }, [profile?.colorTheme, profileId]);

  const heroTheme = useMemo(() => ({
    nameGradient: [parsedTheme.themeTextColor, parsedTheme.themeTextColor] as [string, string],
  }), [parsedTheme.themeTextColor]);

  const userWorks = useMemo(() => {
    if (!profile) return [];
    if (backendWorks.length > 0) return backendWorks;
    return GRID_ITEMS.filter((w) => w.artistId === profile.id);
  }, [profile, backendWorks]);

  const currentArtistId = profileId || "fh-001";

  const artistOriginals = useMemo(() => {
    return ORIGINALS.filter((org) => {
      const hasLedger = mockLedger.some(
        (l) => l.originalId === org.id && (l.artistId === currentArtistId || (!l.artistId && (currentArtistId === "fh-001" || currentArtistId === CURRENT_USER_MOCK.id)))
      );
      const hasRec = MOCK_RECOMMENDATIONS.some(
        (r) => r.original.id === org.id && r.artist.id === currentArtistId
      );
      const hasWork = userWorks.some(
        (w) => w.originalIds?.includes(org.id)
      );
      return hasLedger || hasRec || hasWork;
    });
  }, [currentArtistId, userWorks]);

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
      className="relative w-full min-h-screen overflow-x-clip flex flex-col font-sans"
      style={{ backgroundColor: parsedTheme.themeBgColor }}
    >
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-[90] pointer-events-none" />

      <header
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-5 transition-all duration-500 ${
          isScrolled
            ? "bg-[#070706]/90 backdrop-blur-2xl border-b shadow-lg"
            : "bg-transparent border-b border-transparent"
        }`}
        style={
          isScrolled
            ? {
                borderBottomColor: `${parsedTheme.themeTextColor}33`,
                boxShadow: `0 8px 32px ${parsedTheme.themeTextColor}15`,
              }
            : undefined
        }
      >
        <Logo onClick={() => navigate("/")} showText={false} />

        {/* Center Tab Switcher */}
        <div
          className={`flex items-center gap-6 md:gap-12 transition-all duration-300 ${
            isScrolled
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          {(
            [
              "THEATRE",
              "WALL",
              "LIBRARY",
            ] as ("THEATRE" | "WALL" | "LIBRARY")[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-200 ${
                activeTab === tab
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={{
                color: activeTab === tab ? parsedTheme.themeTextColor : undefined,
                textShadow:
                  activeTab === tab
                    ? `0 0 8px ${parsedTheme.themeTextColor}99, 0 0 16px ${parsedTheme.themeTextColor}4D`
                    : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          <ProfileNav />
        </div>
      </header>

      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')`,
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />

      {/* ─── PROFILE HERO ─── */}
      <ProfileHero
        name={profile.name}
        handle={profile.handle.toUpperCase()}
        tagline={profile.tagline}
        image={profile.image}
        spirit={profile.spirit}
        favoritesCount={profile.favoritesCount}
        theme={heroTheme}
        isFavorited={isFavorited}
        onFavorite={() => setIsFavorited(!isFavorited)}
        socials={profile.socials}
        className="pt-16 md:pt-32 pb-8"
      />

      {/* ─── TABS & CONTENT ─── */}
      <div className="relative z-20 w-full bg-surface-deep min-h-screen text-white">
        <div ref={tabsRowRef} className="relative w-full">
          <div className="w-full flex justify-center py-3.5 md:py-4">
            <div className="flex items-center gap-8 md:gap-16">
              {(
                [
                  "THEATRE",
                  "WALL",
                  "LIBRARY",
                ] as ("THEATRE" | "WALL" | "LIBRARY")[]
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
                        ? `0 0 8px ${parsedTheme.themeTextColor}99, 0 0 16px ${parsedTheme.themeTextColor}4D`
                        : "none",
                    transition: "text-shadow 0.4s ease",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div
            className="w-full h-px"
            style={{
              background: `linear-gradient(to right, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)`,
            }}
          />

          {orbX !== null && (
            <motion.div
              className="absolute pointer-events-none"
              animate={{ x: orbX }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ bottom: "0px" }}
            >
              <div
                className="w-[120px] md:w-[200px] h-[56px] md:h-[64px] -translate-x-1/2"
                style={{
                  background: `radial-gradient(ellipse at 50% 100%, ${parsedTheme.themeTextColor}B3 0%, ${parsedTheme.themeTextColor}4D 40%, transparent 70%)`,
                  filter: "blur(10px)",
                  clipPath: "inset(-200px -200px 0px -200px)",
                }}
              />
            </motion.div>
          )}
        </div>

        {/* ─── TAB CONTENT ─── */}
        <div className="w-full pt-0 pb-20">
          <section className={activeTab === "THEATRE" ? "px-2 md:px-4" : "px-8 md:px-12"}>
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
                  posts={backendWallPosts.length > 0 ? backendWallPosts : getWallPostsByArtist(profileId ?? "")}
                  themeGradient={[parsedTheme.themeTextColor, parsedTheme.themeTextColor]}
                />
              </div>
            )}

            {activeTab === "LIBRARY" && (
              <>
                {artistOriginals.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-4 md:gap-5 items-stretch mt-2">
                    {artistOriginals.map((original, index) => (
                      <OriginalPosterCard
                        key={original.id}
                        original={original}
                        makers={MAKERS_MOCK}
                        stars={STARS_MOCK}
                        index={index}
                        onClick={() => setDossierOriginalId(original.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8">
                    <EmptyState {...EMPTY_PRESETS.library} />
                  </div>
                )}
                <AnimatePresence>
                  {dossierOriginalId && (
                    <MiniDossierSheet
                      originalId={dossierOriginalId}
                      profileId={profile?.id || CURRENT_USER_MOCK.id}
                      onClose={() => setDossierOriginalId(null)}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
