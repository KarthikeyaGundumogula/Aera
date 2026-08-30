import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Check } from "lucide-react";
import { WallPost } from "@/types/wall";
import { TheatreItem } from "@/types/theatre";
import { Original } from "@/types/originals";
import type { Recommendation } from "@/types/recommendations";
import { ReactionId } from "@/types/reactions";
import { ReactionAction } from "@/components/actions/ReactionAction";
import { FHLoader } from "@/components/FHLoader";
import { apiFetch } from "@/lib/api";
import {
  AvatarImage,
  formatRelativeTime,
  LineFull,
  PinFull,
  RecommendationFull,
  LedgerFull,
  mapFramedToRecommendation,
} from "../hall/components/FoyerSwiper";

export default function WallPostPage() {
  const params = useParams<{ artistId?: string; postId?: string; id?: string }>();
  const postId = params.postId || params.id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<WallPost | null>(null);
  const [resolvedWork, setResolvedWork] = useState<TheatreItem | undefined>(undefined);
  const [resolvedOriginal, setResolvedOriginal] = useState<Original | undefined>(undefined);
  const [resolvedRecommendation, setResolvedRecommendation] = useState<Recommendation | undefined>(undefined);
  const [activeReaction, setActiveReaction] = useState<ReactionId | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!postId) {
      setError("No post ID provided");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch(`/artists/wall_post/${postId}`)
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setError(`Post not found (status ${res.status})`);
          setIsLoading(false);
          return;
        }

        const json = await res.json();
        const item = json.data || json.post;
        if (!item) {
          setError("Post data unavailable");
          setIsLoading(false);
          return;
        }

        const mappedPost: WallPost = {
          id: item.id,
          artistId: item.artistId || item.artist_id || "",
          artistName: item.artistName || item.artist_name || "Artist",
          artistImage: item.artistImage || item.artist_image || "",
          type: (() => {
            const hasFrame = !!(
              item.framedRecommendation ||
              item.framed_recommendation ||
              item.framedWork ||
              item.framed_work ||
              item.framedOriginal ||
              item.framed_original
            );
            const hasText = !!(item.text || item.text_line);
            if (hasFrame && hasText) return "QUOTE";
            if (hasFrame) return "FRAME";
            return "LINE";
          })() as WallPost["type"],
          text: item.text || item.text_line,
          postedAt: item.postedAt || item.posted_at || item.createdAt || new Date().toISOString(),
          totalReactions: item.totalReactions || item.total_reactions || 0,
          totalSaves: item.totalSaves || item.total_saves || 0,
          isSaved: item.isSaved || item.is_saved,
          userReaction: item.userReaction || item.user_reaction,
        } as any;

        let mappedRec: Recommendation | undefined = undefined;
        if (item.framedRecommendation || item.framed_recommendation) {
          mappedRec = mapFramedToRecommendation(
            item.framedRecommendation || item.framed_recommendation,
            mappedPost,
          );
        }

        let mappedWork: TheatreItem | undefined = undefined;
        if (item.framedWork || item.framed_work) {
          const fw = item.framedWork || item.framed_work;
          mappedWork = {
            id: fw.id,
            title: fw.title,
            category: fw.workType || fw.work_type || "Edit",
            image: fw.thumbnail,
            thumbnail: fw.thumbnail,
            srcId: fw.srcId || fw.src_id,
            platform: (fw.platform || "youtube").toLowerCase(),
            artist: fw.artistName || fw.artist_name || fw.artistHandle || fw.artist_handle || mappedPost.artistName,
            artistId: fw.artistId || fw.artist_id || mappedPost.artistId,
            artistAvatar: fw.artistAvatar || fw.artist_avatar || mappedPost.artistImage,
          } as any;
        }

        setPost(mappedPost);
        setResolvedWork(mappedWork);
        setResolvedOriginal(item.framedOriginal || item.framed_original);
        setResolvedRecommendation(mappedRec);
        if (item.userReaction || item.user_reaction) {
          setActiveReaction((item.userReaction || item.user_reaction) as ReactionId);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[WallPostPage] Fetch error:", err);
        setError("Failed to load post");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!post) return;

      const shareUrl = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${post.artistName} on Framehouse`,
            text: post.text ? `"${post.text.slice(0, 80)}..."` : `A post by ${post.artistName}`,
            url: shareUrl,
          });
          return;
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      let copied = false;
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch (_) {}
      }
      if (!copied) {
        try {
          const el = document.createElement("textarea");
          el.value = shareUrl;
          el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
          document.body.appendChild(el);
          el.focus();
          el.select();
          copied = document.execCommand("copy");
          document.body.removeChild(el);
        } catch (_) {}
      }
      if (copied) {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    },
    [post],
  );

  const handleReact = useCallback(
    async (reactionId: ReactionId | null) => {
      if (!post) return;
      const prevReaction = activeReaction;
      setActiveReaction(reactionId);

      setPost((prev) => {
        if (!prev) return prev;
        let diff = 0;
        if (!prevReaction && reactionId) diff = 1;
        if (prevReaction && !reactionId) diff = -1;
        return {
          ...prev,
          totalReactions: Math.max(0, (prev.totalReactions || 0) + diff),
          userReaction: reactionId ?? undefined,
        };
      });

      try {
        if (reactionId) {
          await apiFetch("/artists/add_reaction", {
            method: "POST",
            body: JSON.stringify({
              wall_post_id: post.id,
              reaction: reactionId,
            }),
          });
        } else {
          await apiFetch("/artists/remove_reaction", {
            method: "POST",
            body: JSON.stringify({
              wall_post_id: post.id,
            }),
          });
        }
      } catch (err) {
        console.warn("[WallPostPage] Failed to save reaction:", err);
      }
    },
    [post, activeReaction],
  );

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050302] text-white">
        <FHLoader label="Loading Scene..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#050302] text-white px-4 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40">
          {error || "Post not found"}
        </p>
        <button
          onClick={handleClose}
          className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const postLabel =
    post.type === "LINE"
      ? "Line"
      : post.type === "QUOTE"
      ? "Quote"
      : "Frame";

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050302] text-white overflow-hidden select-none z-[150]">
      {/* Top Header: Artist Identity */}
      <div className="fixed top-5 left-4 z-[300] flex items-center gap-2.5 cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity">
        <div
          onClick={() => navigate(`/profile/${post.artistId}`)}
          className="flex items-center gap-2.5"
        >
          <AvatarImage
            src={post.artistImage}
            alt={post.artistName}
            className="w-7 h-7 rounded-lg object-cover object-top border border-white/10 shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {post.artistName}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">
              {postLabel} · {formatRelativeTime(post.postedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Controls: Share + Close */}
      <div className="fixed top-4 right-4 z-[300] flex items-center gap-2">
        <button
          onClick={handleShare}
          className={`w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-200 ${
            copiedShare
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-black/60 border-white/10 text-white/60 hover:text-white"
          }`}
          aria-label="Share this post"
        >
          {copiedShare ? <Check size={15} /> : <Share2 size={15} />}
        </button>
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Single Post Content */}
      <div className="absolute inset-0 w-full h-full flex flex-col px-4 pt-20 pb-16 overflow-y-auto overflow-x-hidden transform-gpu">
        <div className="w-full my-auto shrink-0 flex items-center justify-center pointer-events-auto">
          {post.type === "LINE" ? (
            <div className="w-full pointer-events-none">
              <LineFull post={post} />
            </div>
          ) : resolvedRecommendation ? (
            <div className="w-full pointer-events-none">
              <RecommendationFull
                post={post}
                rec={resolvedRecommendation}
              />
            </div>
          ) : (
            <div className="w-full pointer-events-none">
              <PinFull
                post={post}
                resolvedWork={resolvedWork}
                resolvedOriginal={resolvedOriginal}
                isActive={true}
                onClose={handleClose}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Reaction Action (Bottom Right) */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 z-[300] flex flex-col items-end pointer-events-auto">
        <ReactionAction
          activeReaction={activeReaction}
          onReact={handleReact}
          count={post.totalReactions ?? 0}
          variant="floating"
        />
      </div>
    </div>
  );
}
