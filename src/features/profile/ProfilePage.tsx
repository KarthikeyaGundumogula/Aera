import React, {
  useMemo,
  memo,
  useState,
  useEffect,
  useDeferredValue,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ARTISTS_MOCK, STARS_MOCK, MAKERS_MOCK, GRID_ITEMS } from "../../mock";
import { buildClusters } from "../theatre/engine/clusterBuilder";
import { buildMobileClusters } from "../theatre/engine/mobileClusterBuilder";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";
import { SectionHeader } from "../../components/SectionHeader";
import { Film, ArrowRight } from "lucide-react";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { ProfileHero } from "../shared/profile/ProfileHero";

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
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
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
  const deferredProfileId = useDeferredValue(profileId);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Skip skeleton if we already loaded this profile in the current session
  const [isInitialLoading, setIsInitialLoading] = useState(
    () => !(profileId && loadedProfiles.has(profileId))
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        socials: { instagram: star.actorName.toLowerCase().replace(/ /g, ""), twitter: star.actorName.toLowerCase().replace(/ /g, "") },
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
        socials: { instagram: maker.actorName.toLowerCase().replace(/ /g, ""), twitter: maker.actorName.toLowerCase().replace(/ /g, "") },
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
            className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
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

      {/* ─── THEATRE SECTION ─── */}
      <div className="relative z-20 w-full bg-surface-deep min-h-screen pt-2 pb-20 text-white">
        <section className="px-8 md:px-12">
          {/* Header with Enter Theatre button - Matching OriginalTheatreSection */}
          <div className="mb-12 flex items-center justify-between">
            <SectionHeader 
              iconNode={<div className="w-4 h-px bg-white" />} 
              title="Theatre" 
            />

            <button
              onClick={() => navigate(`/theatre?artist=${profile.id}`)}
              className="group inline-flex items-center gap-2 text-white/40 transition-all hover:text-white active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Enter
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <UnifiedTheatre 
            works={userWorks}
            variant="preview"
            maxClusters={2}
          />
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
