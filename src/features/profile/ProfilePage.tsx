import React, { useMemo, memo, useState, useEffect, useDeferredValue } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PROFILES_DIRECTORY,
  ARTISTS_MOCK,
  STARS_MOCK,
  MAKERS_MOCK,
  GRID_ITEMS,
  ORIGINALS,
} from "../../mock";
import { TheatreItem } from "../../types";
import { buildClusters } from "../theatre/engine/clusterBuilder";
import { StaticDesktopCluster } from "../theatre/components/desktop/StaticDesktopCluster";
import { EditWork, PosterWork, ScriptWork } from "../shared/work";
import { getWorkKind } from "../shared/work/types";
import { SectionHeader } from "../../components/SectionHeader";
import { History, Crown, Users, Heart } from "lucide-react";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { ProfileHero } from "../shared/profile/ProfileHero";

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

const THEMES: Record<
  string,
  {
    bg: string;
    text: string;
    name: string;
    nameGradient: [string, string];
    grainOpacity: number;
  }
> = {
  "profile-pawan-kalyan": {
    bg: "#050505",
    text: "#E5E7EB",
    name: "#6B7280",
    nameGradient: ["#b91c1c", "#ef4444"],
    grainOpacity: 0.03,
  },
  "profile-ram-charan": {
    bg: "#1a120b",
    text: "#E5E7EB",
    name: "#a27b5c",
    nameGradient: ["#4a3728", "#8b5e3c"],
    grainOpacity: 0.05,
  },
  "fh-001": {
    bg: "#0B0E14",
    text: "#E5E7EB",
    name: "#6B7280",
    nameGradient: ["#334155", "#64748b"],
    grainOpacity: 0.04,
  },
};

const DEFAULT_THEME = {
  bg: "#050505",
  text: "#E5E7EB",
  name: "#6B7280",
  nameGradient: ["#b91c1c", "#ef4444"] as [string, string],
  grainOpacity: 0.03,
};

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#050505] overflow-hidden flex flex-col font-sans">
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pt-24 pb-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center opacity-10 select-none pointer-events-none">
          <div className="w-[80vw] h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative w-[320px] h-[480px] sm:w-[400px] sm:h-[600px] rounded-[40px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>

        <div className="mt-12 flex items-center gap-16">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-24 h-3 bg-white/5 rounded-full animate-pulse" />
              <div className="w-16 h-8 bg-white/10 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      <div className="px-6 md:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const deferredProfileId = useDeferredValue(profileId);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simple loading delay to ensure smooth transition
  useEffect(() => {
    setIsInitialLoading(true);
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [profileId]);

  // Find profile in either directory (deferred for performance)
  const profile = useMemo(() => {
    if (!deferredProfileId) return null;

    // 1. Check ARTISTS_MOCK (Fan Creators)
    const artist = ARTISTS_MOCK.find((p) => p.id === deferredProfileId);
    if (artist) {
      return {
        id: artist.id,
        name: artist.name,
        tagline: artist.bio || "Aera Fan Creator",
        image: artist.image,
        followers: `${(Math.random() * 2 + 0.5).toFixed(1)}M`,
        presence: `${artist.presence}%`,
        workedOn: artist.workedOn,
        type: "ARTIST" as const,
      };
    }

    // 2. Check STARS_MOCK (Actors)
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
        followers: "8.2M",
        presence: "Top 0.1%",
        workedOn: star.workedOn,
        type: "STAR" as const,
      };
    }

    // 3. Check MAKERS_MOCK (Crew)
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
        followers: "1.4M",
        presence: "Top 1%",
        workedOn: maker.workedOn,
        type: "MAKER" as const,
      };
    }

    return null;
  }, [deferredProfileId]);

  const theme = deferredProfileId ? THEMES[deferredProfileId] || DEFAULT_THEME : DEFAULT_THEME;

  // Derive works associated with this specific profile
  const userWorks = useMemo(() => {
    if (!profile) return [];

    // If it's an Artist, show their own works
    if (profile.type === "ARTIST") {
      return GRID_ITEMS.filter((w) => w.artistId === profileId);
    }

    // If it's a Star/Maker, show works made for the Originals they were in
    if (profile.workedOn) {
      const workedOnIds = profile.workedOn.map((wo) => wo.id);
      return GRID_ITEMS.filter((w) =>
        w.originalIds?.some((id) => workedOnIds.includes(id)),
      );
    }

    return [];
  }, [profile, profileId]);

  // Derive actual Originals they worked on
  const userOriginals = useMemo(() => {
    if (!profile?.workedOn) return [];
    const workedOnIds = profile.workedOn.map((wo) => wo.id);
    return ORIGINALS.filter((o) => workedOnIds.includes(o.id));
  }, [profile]);

  const desktopClusters = useMemo(
    () => buildClusters(userWorks, "flow"),
    [userWorks],
  );

  if (isInitialLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
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
      {/* Top Gradient Overlay for Header Legibility */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-[90] pointer-events-none" />

      {/* Global Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-6 transition-all duration-500 ${
          isScrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <Logo
          onClick={() => navigate("/")}
          showText={false}
        />
        <div className="flex items-center gap-8">
          <ProfileNav />
        </div>
      </header>

      {/* Texture Overlay: Film Grain / Noise */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')`,
          opacity: theme.grainOpacity,
          mixBlendMode: "overlay",
        }}
      />

      {/* ─── HERO SECTION ─── */}
      <ProfileHero
        name={profile.name}
        handle={profile.id.toUpperCase().replace('PROFILE-', '')}
        tagline={profile.tagline}
        image={profile.image}
        followers={profile.followers}
        presence={profile.presence}
        theme={theme}
        isFollowing={isFollowing}
        onFollow={() => setIsFollowing(!isFollowing)}
        isFavorited={isFavorited}
        onFavorite={() => setIsFavorited(!isFavorited)}
        className="pt-16 md:pt-32 pb-8"
      />

      {/* ─── FEED SECTION ─── */}
      <div className="relative z-20 w-full bg-[#050505] min-h-screen pt-5 pb-5 text-white">
        {userOriginals.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              icon={Crown}
              title="Originals Acted In"
              containerClassName="px-6 md:px-12 mb-6"
            />
            <div className="px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {userOriginals.map((original) => (
                <div
                  key={original.id}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group"
                >
                  <img loading="lazy"
                    src={original.coverImage}
                    alt={original.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-lg font-black uppercase tracking-tight">
                      {original.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-0 sm:px-12 mb-12">
          <SectionHeader
            icon={History}
            title="Works & Reposts"
            containerClassName="px-6 sm:px-0 mb-8"
          />

          {/* Desktop Theatre Clusters */}
          <div className="hidden sm:flex flex-col gap-[2px]">
            {desktopClusters.map((cluster, idx) => (
              <StaticDesktopCluster
                key={`profile-cluster-${idx}`}
                cluster={cluster}
              />
            ))}
          </div>

          {/* Mobile Single Column Stack */}
          <div className="flex sm:hidden flex-col gap-6">
            {userWorks.map((item) => (
              <MobileFeedItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
