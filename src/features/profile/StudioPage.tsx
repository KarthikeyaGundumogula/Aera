import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Film,
  Plus,
  X,
  Shield,
  ShieldCheck,
  Check,
  AlertCircle,
  Bookmark,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useAuth, formatColorTheme } from "../../context/AuthContext";
import { StudioWorkCard } from "./components/StudioWorkCard";
import { LiveStagePreview } from "./components/LiveStagePreview";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import ArtistSetupPage from "./ArtistSetupPage";
import { PasswordResetModal } from "./components/PasswordResetModal";
import { UnsavedChangesModal } from "./components/UnsavedChangesModal";
import { EmptyState, EMPTY_PRESETS } from "../../components/EmptyState";
import { FHLoader } from "../../components/FHLoader";
import { apiFetch } from "../../lib/api";
import type { WallPost } from "../../types/wall";
import type { DiscussionItem } from "@/types/discussions";
import type { Recommendation } from "@/types/recommendations";
import { PostCard } from "../../components/PostCard";
import { DiscussionCard } from "../shared/discussions/DiscussionCard";
import { FeedRecommendationCard } from "../../components/FeedRecommendationCard";
import { ConfirmDeleteModal } from "../shared/modals/ConfirmDeleteModal";
import { PostLineModal } from "../../components/PostLineModal";
import { CreateRecommendationModal } from "../../components/CreateRecommendationModal";

const DEFAULT_AVATAR_PLACEHOLDER = "/assets/profile_card.png";

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
    totalReactions: raw.totalReactions,
    totalSaves: raw.totalSaves,
    isSaved: raw.isSaved,
    userReaction: raw.userReaction,
    postedAt: raw.postedAt,
  };
}

type StudioTab = "works" | "wall" | "discussions" | "recommendations";

interface DeleteTarget {
  type: "work" | "wall_post" | "discussion" | "recommendation";
  id: string;
  originalId?: string;
  title?: string;
}

export default function StudioPage() {
  const { currentArtist, userWorks, fetchUserWorks, updateProfile, updateWorkTitle, deleteWork, refreshProfile } = useAuth();

  const navigate = useNavigate();

  // Profile Form States
  const [stageName, setStageName] = useState("");
  const [tagline, setTagline] = useState("");
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState("50% 0%");
  const [socials, setSocials] = useState({
    instagram: "",
    twitter: "",
    youtube: "",
  });

  const [themeTextColor, setThemeTextColor] = useState("#fac107");
  const [themeBgColor, setThemeBgColor] = useState("#0f1a42");

  // Save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const isNavigatingRef = useRef(false);
  const trapActiveRef = useRef(false);

  // Studio Hub Tabs & Collections
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("works");
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Creation Modals in Studio
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);

  // Secondary Confirmation Delete Target
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWallPosts = useCallback(async () => {
    if (!currentArtist?.id) return;
    try {
      const res = await apiFetch(`/profiles/${currentArtist.id}/wall?limit=50`);
      if (res.ok) {
        const json = await res.json();
        const items = json.data ?? [];
        setWallPosts(items.map(mapBackendWallPost));
      }
    } catch (e) {
      console.warn("[StudioPage] Failed to fetch wall posts:", e);
    }
  }, [currentArtist?.id]);

  const fetchDiscussions = useCallback(async () => {
    if (!currentArtist?.id) return;
    try {
      const res = await apiFetch("/thoughts");
      if (res.ok) {
        const json = await res.json();
        const items = json.data ?? [];
        const mine = items.filter((d: any) =>
          String(d.author_id || d.authorId || d.author?.id) === String(currentArtist.id)
        );
        setDiscussions(mine);
      }
    } catch (e) {
      console.warn("[StudioPage] Failed to fetch discussions:", e);
    }
  }, [currentArtist?.id]);

  const fetchRecommendations = useCallback(async () => {
    if (!currentArtist?.id) return;
    try {
      const res = await apiFetch("/library/recommendations");
      if (res.ok) {
        const json = await res.json();
        const items = json.data ?? [];
        const mine = items.filter((r: any) =>
          String(r.artist?.id || r.artistId || r.artist_id || r.author?.id) === String(currentArtist.id)
        );
        setRecommendations(mine);
      }
    } catch (e) {
      console.warn("[StudioPage] Failed to fetch recommendations:", e);
    }
  }, [currentArtist?.id]);

  // Sync profile details and fetch all creations on-demand when Studio mounts
  useEffect(() => {
    if (currentArtist) {
      setStageName(currentArtist.name || "");
      setTagline(currentArtist.bio || "");
      setPortraitPreview(currentArtist.image || null);
      setImagePosition(currentArtist.imagePosition || "50% 0%");
      setSocials({
        instagram: currentArtist.socials?.instagram || "",
        twitter: currentArtist.socials?.twitter || "",
        youtube: currentArtist.socials?.youtube || "",
      });
      setThemeTextColor(currentArtist.themeTextColor || "#fac107");
      setThemeBgColor(currentArtist.themeBgColor || "#0f1a42");

      // On-demand fetch of creator works and all creations
      fetchUserWorks(currentArtist.id);
      fetchWallPosts();
      fetchDiscussions();
      fetchRecommendations();
    }
  }, [currentArtist, fetchUserWorks, fetchWallPosts, fetchDiscussions, fetchRecommendations]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "work") {
        await deleteWork(deleteTarget.id);
      } else if (deleteTarget.type === "wall_post") {
        const res = await apiFetch(`/artists/delete/wall_post/${deleteTarget.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setWallPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        }
      } else if (deleteTarget.type === "discussion") {
        const res = await apiFetch(`/sets/delete/discussion_post/${deleteTarget.id}`, {
          method: "DELETE",
        }).catch(() => null);
        const resFallback = !res?.ok
          ? await apiFetch(`/sets/delete/discussion/${deleteTarget.id}`, { method: "DELETE" }).catch(() => null)
          : res;
        if (res?.ok || resFallback?.ok) {
          setDiscussions((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        }
      } else if (deleteTarget.type === "recommendation") {
        const res = await apiFetch(`/library/recommendations/${deleteTarget.id}/delete`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRecommendations((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        }
      }
    } catch (e) {
      console.error("[StudioPage] Failed to delete item:", e);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const normalizeHex = (hex?: string, defaultHex = "#FAC107") => {
    if (!hex) return defaultHex.toUpperCase();
    let clean = hex.trim();
    if (!clean.startsWith("#")) clean = `#${clean}`;
    return clean.toUpperCase();
  };

  const isDirty = 
    stageName.trim() !== (currentArtist?.name || "").trim() ||
    tagline.trim() !== (currentArtist?.bio || "").trim() ||
    (portraitPreview || null) !== (currentArtist?.image || null) ||
    imagePosition !== (currentArtist?.imagePosition || "50% 0%") ||
    socials.instagram.trim() !== (currentArtist?.socials?.instagram || "").trim() ||
    socials.twitter.trim() !== (currentArtist?.socials?.twitter || "").trim() ||
    socials.youtube.trim() !== (currentArtist?.socials?.youtube || "").trim() ||
    normalizeHex(themeTextColor, "#FAC107") !== normalizeHex(currentArtist?.themeTextColor, "#FAC107") ||
    normalizeHex(themeBgColor, "#0F1A42") !== normalizeHex(currentArtist?.themeBgColor, "#0F1A42");

  useEffect(() => {
    if (isDirty && !trapActiveRef.current) {
      window.history.pushState(null, "", window.location.href);
      trapActiveRef.current = true;
    } else if (!isDirty && trapActiveRef.current) {
      isNavigatingRef.current = true;
      window.history.back();
      trapActiveRef.current = false;
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }

    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      if (isNavigatingRef.current) return;
      
      trapActiveRef.current = false;

      setPendingNavigation(() => () => {
        isNavigatingRef.current = true;
        window.history.back();
      });
      setIsWarningModalOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  const handleNavigation = (path: string) => {
    if (isDirty) {
      setPendingNavigation(() => () => {
        isNavigatingRef.current = true;
        navigate(path);
      });
      setIsWarningModalOpen(true);
      return;
    }
    isNavigatingRef.current = true;
    navigate(path);
  };

  const handleConfirmLeave = () => {
    setIsWarningModalOpen(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelLeave = () => {
    setIsWarningModalOpen(false);
    setPendingNavigation(null);
    window.history.pushState(null, "", window.location.href);
    trapActiveRef.current = true;
  };

  if (!currentArtist) {
    return <ArtistSetupPage />;
  }

  const handleProfileSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus("idle");
    const startTime = Date.now();

    const success = await updateProfile({
      name: stageName,
      bio: tagline,
      image: portraitPreview || currentArtist.image,
      imagePosition: imagePosition,
      socials: socials,
      themeTextColor,
      themeBgColor,
      color_theme: formatColorTheme(themeTextColor, themeBgColor),
    });

    if (success) {
      const refreshed = await refreshProfile();
      if (refreshed) {
        setStageName(refreshed.name || "");
        setTagline(refreshed.bio || "");
        setPortraitPreview(refreshed.image || null);
        setImagePosition(refreshed.imagePosition || "50% 0%");
        setSocials({
          instagram: refreshed.socials?.instagram || "",
          twitter: refreshed.socials?.twitter || "",
          youtube: refreshed.socials?.youtube || "",
        });
        setThemeTextColor(refreshed.themeTextColor || "#fac107");
        setThemeBgColor(refreshed.themeBgColor || "#0f1a42");
      }
    }

    // Ensure minimum smooth loader visibility for visual UX feedback
    const elapsedTime = Date.now() - startTime;
    const minLoaderTime = 750;
    if (elapsedTime < minLoaderTime) {
      await new Promise((r) => setTimeout(r, minLoaderTime - elapsedTime));
    }

    setIsSaving(false);
    if (success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
    isNavigatingRef.current = false;
  };

  return (
    <div className="relative min-h-screen bg-surface-deep text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pb-32">
      <MobileTopHeader showSearch={false} />

      <header className="hidden md:flex fixed top-0 left-0 right-0 z-[100] items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-black/30 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <Logo onClick={() => handleNavigation("/")} showText={false} />
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigation("/saved")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <Bookmark className="w-4 h-4 fill-amber-400/20" />
            Saved Items
          </button>
          <ProfileNav beforeNavigate={(path) => {
            if (isDirty) {
              setPendingNavigation(() => () => {
                isNavigatingRef.current = true;
                navigate(path);
              });
              setIsWarningModalOpen(true);
              return false;
            }
            isNavigatingRef.current = true;
            return true;
          }} />
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-24 mt-4 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Customize Your Stage Colors Below
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Profile Role: <span className="text-white">{currentArtist.role || "organizer"}</span></span>
            </div>
          </div>
          <LiveStagePreview
            username={currentArtist.userName || currentArtist.name}
            displayName={stageName}
            tagline={tagline}
            portrait={portraitPreview}
            imagePosition={imagePosition}
            themeTextColor={themeTextColor}
            themeBgColor={themeBgColor}
            socials={currentArtist.socials}
            onTextColorChange={setThemeTextColor}
            onBgColorChange={setThemeBgColor}
            onPortraitChange={(_file, preview) => setPortraitPreview(preview)}
            onImagePositionChange={setImagePosition}
          />
        </div>

        <section className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                  Artist Handle (Permanent)
                </label>
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-white/50 cursor-not-allowed select-none truncate">
                  @{currentArtist.userName || currentArtist.name}
                </div>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                  Stage name (max 15 chars)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:border-white/30 focus:bg-white/10 outline-none transition-all"
                  placeholder="ENTER STAGE NAME"
                />
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                  Tagline Bio (max 100 chars)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all leading-relaxed"
                  placeholder="A line about your stage character..."
                />
              </div>

              {/* Socials */}
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    Instagram
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.instagram}
                      onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="@username"
                    />
                    {socials.instagram && (
                      <button
                        onClick={() => setSocials({ ...socials, instagram: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    Twitter / X
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.twitter}
                      onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="@username"
                    />
                    {socials.twitter && (
                      <button
                        onClick={() => setSocials({ ...socials, twitter: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    YouTube
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.youtube}
                      onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="Channel URL / Handle"
                    />
                    {socials.youtube && (
                      <button
                        onClick={() => setSocials({ ...socials, youtube: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-end gap-3 self-stretch lg:pt-6">
            {saveStatus === "success" && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-black uppercase tracking-wider justify-center">
                <Check className="w-3.5 h-3.5" /> Stage Saved
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-1.5 text-red-400 text-[9px] font-black uppercase tracking-wider justify-center">
                <AlertCircle className="w-3.5 h-3.5" /> Update Failed
              </div>
            )}
            <button
              onClick={handleProfileSave}
              disabled={!isDirty || isSaving}
              className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg ${
                isDirty && !isSaving
                  ? "bg-white text-black hover:bg-white/90 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Stage"
              )}
            </button>
          </div>
        </section>

        <section className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
                  Security Settings
                </h2>
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                Manage your account credentials and access
              </p>
            </div>
            
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
            >
              Update Password
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {/* Studio Management Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-white/40" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
                  Studio Hub
                </h2>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                  Manage creations & releases
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => handleNavigation("/saved")}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-black text-[9px] uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                <Bookmark className="w-4 h-4 fill-amber-400/20" />
                Saved Items
              </button>

              {activeStudioTab === "works" && (
                <button
                  onClick={() => handleNavigation("/works/new")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Release
                </button>
              )}

              {activeStudioTab === "wall" && (
                <button
                  onClick={() => setIsLineModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Post Line
                </button>
              )}

              {activeStudioTab === "discussions" && (
                <button
                  onClick={() => handleNavigation("/sets")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Explore Sets
                </button>
              )}

              {activeStudioTab === "recommendations" && (
                <button
                  onClick={() => setIsRecModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Recommend
                </button>
              )}
            </div>
          </div>

          {/* Sub-Navigation Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: "works" as const, label: "Releases", icon: Film, count: userWorks.length },
              { id: "wall" as const, label: "Wall Posts", icon: MessageSquare, count: wallPosts.length },
              { id: "discussions" as const, label: "Discussions", icon: MessageSquare, count: discussions.length },
              { id: "recommendations" as const, label: "Recommendations", icon: Sparkles, count: recommendations.length },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeStudioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStudioTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white text-black shadow-lg shadow-white/5"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[8px] rounded-full font-mono ${
                      isActive ? "bg-black/15 text-black" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          {activeStudioTab === "works" && (
            userWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userWorks.map((work) => (
                  <StudioWorkCard
                    key={work.id}
                    item={work}
                    onRename={(newTitle) => updateWorkTitle(work.id, newTitle)}
                    onDelete={() => setDeleteTarget({ type: "work", id: String(work.id), title: work.title })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                {...EMPTY_PRESETS.studioWorks}
                actionLabel="Release First Work"
                onAction={() => handleNavigation("/works/new")}
              />
            )
          )}

          {activeStudioTab === "wall" && (
            wallPosts.length > 0 ? (
              <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                {wallPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={() => setDeleteTarget({ type: "wall_post", id: post.id, title: post.text || "Wall Post" })}
                    isDeleting={isDeleting && deleteTarget?.id === post.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                {...EMPTY_PRESETS.wall}
                actionLabel="Post First Line"
                onAction={() => setIsLineModalOpen(true)}
              />
            )
          )}

          {activeStudioTab === "discussions" && (
            discussions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {discussions.map((disc) => {
                  const targetSetId = disc.setId || (disc as any).set_id;
                  return (
                    <DiscussionCard
                      key={disc.id}
                      thought={disc}
                      onCardClick={() => handleNavigation(targetSetId ? `/sets/${targetSetId}/discussions/${disc.id}` : `/discussions/${disc.id}`)}
                      onDelete={(_id, e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: "discussion", id: disc.id, title: disc.title });
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No Discussions Yet"
                description="You haven't initiated any discussion threads or dispatches yet."
                badge="DISCUSSIONS"
                actionLabel="Explore Sets"
                onAction={() => handleNavigation("/sets")}
              />
            )
          )}

          {activeStudioTab === "recommendations" && (
            recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <FeedRecommendationCard
                    key={rec.id}
                    rec={rec}
                    onDelete={() => setDeleteTarget({ type: "recommendation", id: rec.id, title: rec.original?.title || rec.comment || "Recommendation" })}
                    isDeleting={isDeleting && deleteTarget?.id === rec.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No Recommendations Yet"
                description="You haven't posted any film recommendations or curated scores yet."
                badge="RECOMMENDATIONS"
                actionLabel="Recommend a Title"
                onAction={() => setIsRecModalOpen(true)}
              />
            )
          )}
        </section>
      </div>

      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="p-8 bg-[#0b0c10] border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center">
              <FHLoader label="Saving & Synchronizing Stage Profile..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PasswordResetModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <UnsavedChangesModal
        isOpen={isWarningModalOpen}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={
          deleteTarget?.type === "work"
            ? "Delete Release?"
            : deleteTarget?.type === "wall_post"
            ? "Delete Wall Post?"
            : deleteTarget?.type === "discussion"
            ? "Delete Discussion?"
            : deleteTarget?.type === "recommendation"
            ? "Delete Recommendation?"
            : "Delete Item?"
        }
        description={
          deleteTarget ? (
            <span>
              Are you sure you want to permanently delete{" "}
              <span className="text-white font-bold">
                {deleteTarget.title ? `"${deleteTarget.title}"` : "this item"}
              </span>
              ? This action cannot be undone.
            </span>
          ) : undefined
        }
      />

      <PostLineModal
        isOpen={isLineModalOpen}
        onClose={() => {
          setIsLineModalOpen(false);
          fetchWallPosts();
        }}
      />

      <CreateRecommendationModal
        isOpen={isRecModalOpen}
        onClose={() => {
          setIsRecModalOpen(false);
          fetchRecommendations();
        }}
      />
    </div>
  );
}
