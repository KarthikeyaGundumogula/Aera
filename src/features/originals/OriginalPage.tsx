import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BookPlus, Settings, Plus, Loader2, Heart } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import { PersonProfile, MakerProfile } from "../shared/profile";
import { SectionHeader } from "../../components/SectionHeader";
import { CinematicPageHeader } from "../../components/CinematicPageHeader";
import { FavoriteButton } from "../../components/FavoriteButton";
import { apiFetch } from "@/lib/api";

import { useAuth } from "../../context/AuthContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TheatrePreviewSection } from "../theatre/components/TheatrePreviewSection";
import { ArtistSpotlightGrid } from "../../components/ArtistSpotlightGrid";
import { OriginalStats } from "./components/OriginalStats";
import { HeroResonanceSignature } from "./components/HeroResonanceSignature";
import { CommandCenter, CommandItem } from "../../components/CommandCenter";
import { OriginalManagementModal } from "./components/OriginalManagementModal";
import { RecentReleasesSection } from "../shared/components/RecentReleasesSection";
import { PosterImage } from "../../components/PosterImage";
import { formatReleaseDate } from "@/utils/time";
import { Original } from "../../types/originals";
import { TheatreItem } from "../../types";

interface OriginalClaims {
  canUpdateMeta: boolean;
  canCreateRelease: boolean;
}

export function OriginalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentArtist } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [showManagement, setShowManagement] = useState(false);
  const isMobile = useMediaQuery();
  const [localOriginal, setLocalOriginal] = useState<Original | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [officialReleases, setOfficialReleases] = useState<any[]>([]);
  const [theatreWorks, setTheatreWorks] = useState<TheatreItem[]>([]);
  const [loading, setLoading] = useState(true);

  const original = localOriginal;

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    apiFetch(`/originals/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const remote = json.data;
          if (remote && isMounted) {
            const remoteFav = !!remote.isFavorited;
            const remoteFavCount = remote.stats?.favorites ?? 0;
            setIsFavorited(remoteFav);
            setFavoritesCount(remoteFavCount);

            const mappedOriginal = {
              id: remote.id,
              title: remote.title,
              description: remote.description || "",
              coverImage:
                remote.coverImage ||
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
              releaseDate: remote.releaseDate || undefined,
              genre: remote.genre || [],
              stats: {
                presence: remote.stats?.presence || 0,
                members: remote.stats?.members || 0,
                releases: remote.stats?.releases || 0,
                favorites: remoteFavCount,
              },
              isFavorited: remoteFav,
              resonanceSignature: remote.resonanceSignature || undefined,
              stars: (remote.stars || []).map((s: any) => ({
                id: s.id,
                userName: s.userName,
                actorName: s.actorName || "Cast Member",
                characterName: s.characterName || "Star",
                imageUrl:
                  s.imageUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                originalId: remote.id,
              })),
              makers: (remote.makers || []).map((m: any) => ({
                id: m.id,
                userName: m.userName,
                actorName: m.actorName || "Filmmaker",
                characterName: m.characterName || "Maker",
                imageUrl:
                  m.imageUrl ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                originalId: remote.id,
              })),
              topArtists: (remote.topArtists || []).map((a: any) => ({
                id: a.id,
                name: a.name || "Artist",
                image:
                  a.image ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                spirit: a.spirit || 0,
                works: a.works || 0,
              })),
              works: [],
            };
            setLocalOriginal(mappedOriginal);
          }
        }
      })
      .catch((err) => {
        console.error("[OriginalPage] Failed to fetch original detail:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Separately fetch lightweight theatre cards (GET /originals/{id}/theatre)
    apiFetch(`/originals/${id}/theatre?limit=20`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const theatreCards = json.data ?? [];
          if (
            Array.isArray(theatreCards) &&
            isMounted &&
            theatreCards.length > 0
          ) {
            const mappedWorks: TheatreItem[] = theatreCards.map((w: any) => ({
              id: w.id,
              title: w.title || "Untitled Work",
              category: w.workType || "Edit",
              image:
                w.thumbnail ||
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
              platform: "youtube" as const,
              srcId: w.id,
            }));
            setTheatreWorks(mappedWorks);
          }
        }
      })
      .catch((err) => {
        console.warn("[OriginalPage] Separate theatre fetch failed:", err);
      });

    // Separately fetch official releases (GET /originals/{id}/releases)
    apiFetch(`/originals/${id}/releases`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const rels = json.data ?? [];
          if (Array.isArray(rels) && isMounted) {
            setOfficialReleases(rels);
          }
        }
      })
      .catch((err) => {
        console.warn("[OriginalPage] Separate releases fetch failed:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isAssociatedOwner = Boolean(
    currentArtist &&
    (currentArtist.role?.toLowerCase() === "associated_owner" ||
      currentArtist.role?.toLowerCase() === "admin"),
  );

  const userClaims: OriginalClaims = {
    canUpdateMeta: isAssociatedOwner,
    canCreateRelease: isAssociatedOwner,
  };

  const handleSaveToLedger = useCallback(async () => {
    if (!original?.id) return;
    if (!currentArtist) {
      triggerToast("Sign in required to save to Ledger");
      return;
    }
    try {
      const res = await apiFetch("/library/new", {
        method: "POST",
        body: JSON.stringify({
          original_id: original.id,
          visibility: true,
          status: "WANT_TO_WATCH",
          entry_type: "MOVIE",
          surge_score: 0,
        }),
      });
      if (res.ok) {
        triggerToast("Saved to Ledger");
      } else {
        const json = await res.json().catch(() => null);
        const raw = (json?.message || json?.error || "").toLowerCase();
        if (
          res.status === 409 ||
          res.status === 400 ||
          raw.includes("already") ||
          raw.includes("exist") ||
          raw.includes("identifier") ||
          raw.includes("duplicate") ||
          raw.includes("unique")
        ) {
          triggerToast("Already added");
        } else {
          triggerToast("Unable to save to Ledger");
        }
      }
    } catch {
      triggerToast("Network error");
    }
  }, [original?.id, currentArtist]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!original?.id) return;
    if (!currentArtist) {
      triggerToast("Sign in required to favorite Originals");
      navigate("/profile/login");
      return;
    }

    const nextState = !isFavorited;
    const prevFavorited = isFavorited;
    const prevCount = favoritesCount;
    const nextCount = Math.max(0, nextState ? prevCount + 1 : prevCount - 1);

    // Optimistic UI update
    setIsFavorited(nextState);
    setFavoritesCount(nextCount);
    setLocalOriginal((prev) =>
      prev
        ? {
            ...prev,
            isFavorited: nextState,
            stats: {
              ...prev.stats,
              favorites: nextCount,
            },
          }
        : prev
    );

    try {
      const endpoint = nextState ? "/originals/favorite" : "/originals/unfavorite";
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(original.id),
      });

      if (!res.ok) {
        console.warn(`[OriginalPage] Favorite request failed with status ${res.status}`);
        setIsFavorited(prevFavorited);
        setFavoritesCount(prevCount);
        setLocalOriginal((prev) =>
          prev
            ? {
                ...prev,
                isFavorited: prevFavorited,
                stats: {
                  ...prev.stats,
                  favorites: prevCount,
                },
              }
            : prev
        );
        triggerToast("Failed to update favorite status");
      } else {
        triggerToast(nextState ? "Added to favorites" : "Removed from favorites");
      }
    } catch (err) {
      console.warn("[OriginalPage] Favorite request error:", err);
      setIsFavorited(prevFavorited);
      setFavoritesCount(prevCount);
      setLocalOriginal((prev) =>
        prev
          ? {
              ...prev,
              isFavorited: prevFavorited,
              stats: {
                ...prev.stats,
                favorites: prevCount,
              },
            }
          : prev
      );
      triggerToast("Network error");
    }
  }, [original?.id, currentArtist, isFavorited, favoritesCount, navigate]);

  const commandItems: CommandItem[] = useMemo(
    () => [
      {
        label: isFavorited ? "Favorited" : "Favorite Original",
        icon: (
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? "text-amber-400 fill-amber-400" : ""
            }`}
          />
        ),
        action: handleFavoriteToggle,
        description: isFavorited ? "Remove from Favorites" : "Add to Favorites",
        visible: isAssociatedOwner,
      },
      {
        label: "Add to Ledger",
        icon: <BookPlus className="w-4 h-4" />,
        action: handleSaveToLedger,
        description: "Add to Ledger",
        visible: isAssociatedOwner,
      },
      {
        label: "Update Original",
        icon: <Settings className="w-4 h-4" />,
        action: () => setShowManagement(true),
        description: "Curation & Metadata",
        visible: userClaims.canUpdateMeta,
      },
      {
        label: "New Release",
        icon: <Plus className="w-4 h-4" />,
        action: () => navigate(`/originals/${original?.id}/releases/new`),
        description: "Drop an Update",
        visible: userClaims.canCreateRelease,
      },
    ],
    [
      navigate,
      original?.id,
      handleFavoriteToggle,
      isFavorited,
      handleSaveToLedger,
      isAssociatedOwner,
      userClaims.canCreateRelease,
      userClaims.canUpdateMeta,
    ],
  );

  // Defer expensive secondary data so the page paints immediately on navigation
  const deferredOriginal = useDeferredValue(original);

  const artistStripItems = useMemo(() => {
    if (!deferredOriginal || !deferredOriginal.topArtists?.length) return [];
    return deferredOriginal.topArtists;
  }, [deferredOriginal]);

  useEffect(() => {
    if (!original || location.hash !== "#releases") return;
    document.getElementById("releases")?.scrollIntoView({ behavior: "smooth" });
  }, [original, location.hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
          Loading Original Details…
        </span>
      </div>
    );
  }

  if (!original) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Original not found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-white text-black rounded-xl font-bold"
          >
            Hall
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep overflow-y-auto no-scrollbar transition-all duration-300 pt-[68px] md:pt-[72px]">
      {/* Hero Header Transformation */}
      <motion.div
        animate={{
          height: isMobile ? "65vh" : "75vh",
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full overflow-hidden"
      >
        <div className="absolute inset-0">
          <PosterImage
            loading="lazy"
            src={original.coverImage}
            alt={original.title}
            info={original.genre?.slice(0, 2).join(" • ")}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* Initial Info Overlay */}
          <div className="absolute bottom-20 md:bottom-24 left-0 px-4 sm:px-6 py-6 w-full max-w-[95vw]">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h1
                className="font-black tracking-tighter mb-2 uppercase leading-[0.82] whitespace-pre-wrap drop-shadow-2xl"
                style={{
                  fontSize: !original.title.includes(" ")
                    ? `clamp(2.5rem, ${Math.min(14, 90 / (original.title.length * 0.8))}vw, 7rem)`
                    : `clamp(2.5rem, ${Math.max(5, 15 - original.title.length * 0.3)}vw, 7rem)`,
                  wordBreak: "normal",
                  overflowWrap: "normal",
                }}
              >
                {original.title}
              </h1>
              <HeroResonanceSignature signature={original.resonanceSignature} />
            </motion.div>
          </div>
        </div>

        {/* Sticky Header */}
        <CinematicPageHeader
          title={
            isMobile && original.title.length > 6
              ? `${original.title.substring(0, 6)}..`
              : original.title
          }
          onBack={() => navigate("/")}
          onTitleClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          rightActions={
            <>
              {/* Favorite Action Button */}
              <FavoriteButton
                isFavorited={isFavorited}
                onFavorite={handleFavoriteToggle}
                iconSize={18}
                className="p-2 rounded-xl border transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.06] active:scale-95 border-white/[0.08] hover:border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md cursor-pointer"
                activeColor="#F59E0B"
              >
                {favoritesCount > 0 && (
                  <span className="font-mono text-[10px] font-bold text-white/80 hidden sm:inline-block">
                    {favoritesCount}
                  </span>
                )}
              </FavoriteButton>
              <div className="hidden sm:block h-4 w-px bg-white/10" />

              {isAssociatedOwner ? (
                <>
                  <CommandCenter
                    contextTitle="Original Studio"
                    items={commandItems}
                  />
                  <div className="hidden sm:block h-4 w-px bg-white/10" />
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveToLedger}
                    className="relative group flex items-center gap-2 p-2 rounded-xl border transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.06] active:scale-95 border-white/[0.08] hover:border-white/[0.15] shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md text-white"
                    aria-label="Save to Ledger"
                  >
                    <BookPlus className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/70 group-hover:text-white font-bold hidden sm:inline-block">
                      Add to Ledger
                    </span>
                  </button>
                  <div className="hidden sm:block h-4 w-px bg-white/10" />
                </>
              )}
              <button
                onClick={() =>
                  document
                    .getElementById("releases")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group flex items-center gap-2 transition-all hover:text-white/70 active:scale-95 text-white"
              >
                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">
                  Releases
                </span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </>
          }
        />

        <OriginalStats
          stats={{
            ...original.stats,
            favorites: favoritesCount,
          }}
          signature={original.resonanceSignature}
        />
      </motion.div>

      {/* RECENT RELEASES */}
      <div id="releases">
        <RecentReleasesSection
          customReleases={officialReleases}
          className="pt-8 pb-6"
        />
      </div>

      {/* Star Spotlight */}
      {original.stars && original.stars.length > 0 && (
        <section className="px-8 pt-6 pb-4">
          <SectionHeader title="Stars" containerClassName="mb-6" />

          <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
            <div className="flex gap-4 sm:gap-6 w-max">
              {original.stars.map((star, index) => (
                <PersonProfile
                  key={star.actorName || `star-${index}`}
                  person={star}
                  delay={index * 0.15}
                  type="Star"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Makers Spotlight */}
      {original.makers && original.makers.length > 0 && (
        <section className="px-8 pt-6 pb-4">
          <SectionHeader title="Makers" containerClassName="mb-6" />

          <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
            <div className="flex gap-4 sm:gap-6 w-max">
              {original.makers.map((maker, index) => (
                <MakerProfile
                  key={maker.actorName || `maker-${index}`}
                  person={maker}
                  delay={index * 0.15}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Artists */}
      {artistStripItems.length > 0 && (
        <ArtistSpotlightGrid
          title="Artist Spotlight"
          artists={artistStripItems}
          rows={2}
          variant="default"
          containerClassName="pt-4 pb-4"
        />
      )}

      {/* Originals Theatre Section */}
      <TheatrePreviewSection
        title="Theatre"
        works={theatreWorks.length > 0 ? theatreWorks : original.works || []}
        enterUrl={`/originals/${original.id}/theatre`}
      />

      {/* Detailed Information */}
      <div className="p-8 pt-0">
        <SectionHeader
          iconNode={<div className="w-4 h-px bg-white" />}
          title="Detailed Information"
          containerClassName="mb-8"
        />

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
              Full Description
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {original.description} This curated original represents a pinnacle
              of cinematic achievement, bringing together the most impactful
              visual and narrative elements from the {original.title} universe.
            </p>
          </div>

          {original.releaseDate && formatReleaseDate(original.releaseDate) && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                Release Date
              </h4>
              <p className="text-sm text-white/80 font-mono tracking-tighter">
                {formatReleaseDate(original.releaseDate)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Space */}
      <div className="h-24" />

      {/* Visual Hit Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-xl z-[200] flex items-center gap-2 pointer-events-none shadow-2xl"
          >
            <BookPlus size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Management Modal */}
      <AnimatePresence>
        {showManagement && isAssociatedOwner && (
          <OriginalManagementModal
            original={original}
            onClose={() => setShowManagement(false)}
            onSave={(updated) =>
              setLocalOriginal((prev: any) =>
                prev ? { ...prev, ...updated } : prev,
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
