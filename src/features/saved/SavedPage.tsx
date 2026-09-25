import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bookmark,
  Sparkles,
  ArrowLeft,
  Film,
  MessageSquare,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { PostCard } from "../../components/PostCard";
import { FeedRecommendationCard } from "../../components/FeedRecommendationCard";
import { useWorkNavigation } from "../../hooks/useWorkNavigation";
import { FHLoader } from "@/components/FHLoader";
import { apiFetch } from "@/lib/api";
import { DEFAULT_AVATAR_PLACEHOLDER } from "@/constants/placeholders";
import type { TheatreItem } from "../../types";
import type { WallPost } from "../../types/wall";
import type { Recommendation } from "@/types/recommendations";

type SavedCategory = "works" | "recommendations" | "wall_posts";

const PAGE_SIZE = 20;

interface SavedWorkItem {
  id: string;
  title: string | null;
  workType: string;
  thumbnail: string | null;
  srcId: string | null;
  platform: string | null;
  artistName: string | null;
  artistAvatar: string | null;
  artistHandle: string | null;
}

function mapSavedWorkToTheatreItem(work: SavedWorkItem): TheatreItem {
  const rawCategory = work.workType || "Edit";
  const category: TheatreItem["category"] =
    rawCategory.toUpperCase() === "EDIT"
      ? "Edit"
      : rawCategory.toUpperCase() === "POSTER"
      ? "Poster"
      : rawCategory.toUpperCase() === "SCRIPT" || rawCategory.toUpperCase() === "STORYBOARD"
      ? "Storyboard"
      : "Edit";

  let thumbnail = work.thumbnail || undefined;
  let srcId: string | undefined = work.srcId || undefined;
  let platform: TheatreItem["platform"] | undefined =
    (work.platform?.toLowerCase() as TheatreItem["platform"]) || undefined;

  if (thumbnail && thumbnail.includes("youtube")) {
    const match = thumbnail.match(/vi\/([^/]+)\//);
    if (match) {
      srcId = srcId || match[1];
      platform = platform || "youtube";
    }
  }

  if (category === "Edit" && srcId && !thumbnail && (!platform || platform === "youtube")) {
    thumbnail = `https://img.youtube.com/vi/${srcId}/hqdefault.jpg`;
    platform = platform || "youtube";
  }

  return {
    id: work.id,
    title: work.title ?? undefined,
    category,
    image: thumbnail,
    srcId,
    platform,
    artist: work.artistName ?? undefined,
    artistAvatar: work.artistAvatar ?? undefined,
    artistHandle: work.artistHandle ?? undefined,
  };
}

function mapBackendWallPost(raw: any): WallPost {
  const framedWorkId = raw.framedWorkId || raw.pinnedWorkId;
  const framedOriginalId = raw.framedOriginalId || raw.pinnedOriginalId;
  const framedRecommendationId = raw.framedRecommendationId || raw.pinnedRecommendationId;

  let type: WallPost["type"] = "LINE";
  if (framedWorkId) type = "PIN_WORK";
  else if (framedOriginalId) type = "PIN_ORIGINAL";
  else if (framedRecommendationId) type = "RECOMMENDATION";

  return {
    id: raw.id,
    artistId: raw.artistId || "",
    artistName: raw.artistName || "Artist",
    artistImage: raw.artistImage || DEFAULT_AVATAR_PLACEHOLDER,
    type,
    text: raw.text ?? undefined,
    framedWorkId: framedWorkId ?? undefined,
    pinnedWorkId: framedWorkId ?? undefined,
    framedWork: raw.framedWork ?? undefined,
    framedOriginalId: framedOriginalId ?? undefined,
    pinnedOriginalId: framedOriginalId ?? undefined,
    framedOriginal: raw.framedOriginal ?? undefined,
    framedRecommendationId: framedRecommendationId ?? undefined,
    pinnedRecommendationId: framedRecommendationId ?? undefined,
    framedRecommendation: raw.framedRecommendation ?? undefined,
    totalReactions: raw.totalReactions ?? 0,
    totalSaves: raw.totalSaves ?? 0,
    isSaved: true,
    userReaction: raw.userReaction,
    postedAt: raw.postedAt,
  };
}

const TABS: { id: SavedCategory; label: string; icon: React.ElementType }[] = [
  { id: "works", label: "Works", icon: Film },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
  { id: "wall_posts", label: "Wall Posts", icon: MessageSquare },
];

export default function SavedPage() {
  const { currentArtist } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openWork } = useWorkNavigation();

  // Tab State synced with URL query param `?tab=`
  const tabParam = searchParams.get("tab") as SavedCategory | null;
  const activeTab: SavedCategory =
    tabParam === "recommendations" || tabParam === "wall_posts" ? tabParam : "works";

  // Data states per category
  const [works, setWorks] = useState<SavedWorkItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);

  // Category status tracking
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<Record<SavedCategory, boolean>>({
    works: true,
    recommendations: true,
    wall_posts: true,
  });
  const [loaded, setLoaded] = useState<Record<SavedCategory, boolean>>({
    works: false,
    recommendations: false,
    wall_posts: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // Fetch category data
  const fetchCategory = useCallback(
    async (cat: SavedCategory, offset: number) => {
      const isInitial = offset === 0;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        let endpoint = "";
        if (cat === "works") {
          endpoint = `/artists/saved_works?limit=${PAGE_SIZE}&offset=${offset}`;
        } else if (cat === "recommendations") {
          endpoint = `/artists/saved_recommendations?limit=${PAGE_SIZE}&offset=${offset}`;
        } else {
          endpoint = `/artists/saved_wall_posts?limit=${PAGE_SIZE}&offset=${offset}`;
        }

        const res = await apiFetch(endpoint);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const msg = errJson.error || errJson.message || `Failed to fetch saved ${cat}.`;
          throw new Error(msg);
        }

        const json = await res.json();
        const data: any[] = json.data || [];

        if (cat === "works") {
          setWorks((prev) => (isInitial ? data : [...prev, ...data]));
        } else if (cat === "recommendations") {
          setRecommendations((prev) => (isInitial ? data : [...prev, ...data]));
        } else {
          const mappedPosts = data.map(mapBackendWallPost);
          setWallPosts((prev) => (isInitial ? mappedPosts : [...prev, ...mappedPosts]));
        }

        setHasMore((prev) => ({ ...prev, [cat]: data.length >= PAGE_SIZE }));
        setLoaded((prev) => ({ ...prev, [cat]: true }));
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while loading saved items.");
      } finally {
        if (isInitial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    []
  );

  // Trigger category fetch when switching tabs if not already loaded
  useEffect(() => {
    if (currentArtist && !loaded[activeTab]) {
      fetchCategory(activeTab, 0);
    }
  }, [activeTab, currentArtist, loaded, fetchCategory]);

  // Access Control: Accessible only to logged-in users
  if (!currentArtist) {
    return <Navigate to="/profile/login" replace />;
  }

  const handleTabChange = (newTab: SavedCategory) => {
    if (newTab === activeTab) return;
    setSearchParams({ tab: newTab });
  };

  const handleLoadMore = () => {
    const currentLen =
      activeTab === "works"
        ? works.length
        : activeTab === "recommendations"
        ? recommendations.length
        : wallPosts.length;
    fetchCategory(activeTab, currentLen);
  };

  // Unsave handlers
  const handleUnsaveWork = async (workId: string) => {
    const prevWorks = works;
    setWorks((prev) => prev.filter((w) => w.id !== workId));
    showToast("Removed from saved works");
    try {
      const res = await apiFetch("/artists/unsave_work", {
        method: "DELETE",
        body: JSON.stringify(workId),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || "Failed to remove saved work.");
      }
    } catch (err: any) {
      setWorks(prevWorks);
      showToast(err.message || "Failed to remove saved work.");
    }
  };

  const handleUnsaveRecommendation = async (recId: string) => {
    const prevRecs = recommendations;
    setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    showToast("Removed from saved recommendations");
    try {
      const res = await apiFetch("/artists/unsave_recommendation", {
        method: "DELETE",
        body: JSON.stringify(recId),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error || errJson.message || "Failed to remove saved recommendation."
        );
      }
    } catch (err: any) {
      setRecommendations(prevRecs);
      showToast(err.message || "Failed to remove saved recommendation.");
    }
  };

  const handleUnsaveWallPost = async (postId: string) => {
    const prevPosts = wallPosts;
    setWallPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast("Removed from saved wall posts");
    try {
      const res = await apiFetch("/artists/unsave_wall_post", {
        method: "DELETE",
        body: JSON.stringify(postId),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || "Failed to remove saved wall post.");
      }
    } catch (err: any) {
      setWallPosts(prevPosts);
      showToast(err.message || "Failed to remove saved wall post.");
    }
  };

  // Helper to construct post for work rendering
  const buildWorkPostObject = (theatreItem: TheatreItem, rawWork: SavedWorkItem): WallPost => {
    return {
      id: `saved-work-${rawWork.id}`,
      artistId: rawWork.artistHandle || "",
      artistName: rawWork.artistName || "Artist",
      artistImage: rawWork.artistAvatar || DEFAULT_AVATAR_PLACEHOLDER,
      type: "PIN_WORK",
      pinnedWorkId: String(rawWork.id),
      text: undefined,
      postedAt: "Saved Work",
      isSaved: true,
    };
  };

  const currentCount =
    activeTab === "works"
      ? works.length
      : activeTab === "recommendations"
      ? recommendations.length
      : wallPosts.length;

  return (
    <div className="min-h-screen bg-[#070707] text-white pb-24 pt-6 md:pt-10 px-4 sm:px-8 md:px-12">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                Saved Items
              </h1>
              <p className="text-xs font-mono text-white/40 mt-0.5">
                {currentCount} {activeTab.replace("_", " ")} saved
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] p-1 rounded-2xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "text-white font-bold"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="savedTabIndicator"
                      className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-3 text-red-400 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchCategory(activeTab, 0)}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-[10px] font-black uppercase tracking-widest text-white transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !loaded[activeTab] ? (
          <div className="py-24 flex justify-center items-center">
            <FHLoader label={`Loading saved ${activeTab.replace("_", " ")}...`} />
          </div>
        ) : (
          <>
            {/* 1. Works Tab */}
            {activeTab === "works" && (
              <>
                {works.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {works.map((work) => {
                      const theatreItem = mapSavedWorkToTheatreItem(work);
                      const post = buildWorkPostObject(theatreItem, work);
                      return (
                        <div key={work.id} className="w-full">
                          <PostCard
                            post={post}
                            resolvedWork={theatreItem}
                            isSaved={true}
                            onToggleSave={() => handleUnsaveWork(work.id)}
                            onClick={() => openWork(theatreItem)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptySavedState
                    title="No Saved Works Yet"
                    description="Works you bookmark across the stage and collection feeds will appear here."
                    buttonText="Explore Stage"
                    onAction={() => navigate("/")}
                    icon={Film}
                  />
                )}
              </>
            )}

            {/* 2. Recommendations Tab */}
            {activeTab === "recommendations" && (
              <>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="w-full">
                        <FeedRecommendationCard
                          rec={rec}
                          isSaved={true}
                          onToggleSave={() => handleUnsaveRecommendation(rec.id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySavedState
                    title="No Saved Recommendations"
                    description="Recommendations you bookmark from artists and films will appear here."
                    buttonText="Explore Hall"
                    onAction={() => navigate("/")}
                    icon={Sparkles}
                  />
                )}
              </>
            )}

            {/* 3. Wall Posts Tab */}
            {activeTab === "wall_posts" && (
              <>
                {wallPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {wallPosts.map((post) => (
                      <div key={post.id} className="w-full">
                        <PostCard
                          post={post}
                          isSaved={true}
                          onToggleSave={() => handleUnsaveWallPost(post.id)}
                          onClick={() => {
                            if (post.framedWork) {
                              openWork(
                                mapSavedWorkToTheatreItem(post.framedWork as any)
                              );
                            } else if (post.framedOriginalId) {
                              navigate(`/originals/${post.framedOriginalId}`);
                            } else if (post.artistId && post.id) {
                              navigate(`/wall/${post.artistId}/${post.id}`);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySavedState
                    title="No Saved Wall Posts"
                    description="Thoughts, lines, and updates you bookmark from artist walls will appear here."
                    buttonText="Explore Feed"
                    onAction={() => navigate("/")}
                    icon={MessageSquare}
                  />
                )}
              </>
            )}

            {/* Pagination: Load More Button */}
            {hasMore[activeTab] && currentCount > 0 && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-xs font-black uppercase tracking-widest text-white/80 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                  )}
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#141414] border border-white/20 text-xs font-mono text-white shadow-2xl flex items-center gap-2.5 pointer-events-none"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface EmptySavedStateProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon: React.ElementType;
}

function EmptySavedState({
  title,
  description,
  buttonText,
  onAction,
  icon: Icon,
}: EmptySavedStateProps) {
  return (
    <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
          {title}
        </h3>
        <p className="text-xs font-mono text-white/40 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      </div>
      <button
        onClick={onAction}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {buttonText}
      </button>
    </div>
  );
}
