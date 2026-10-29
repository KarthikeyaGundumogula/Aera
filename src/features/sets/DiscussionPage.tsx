import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { ArtistProfile } from "../shared/profile";
import { apiFetch } from "@/lib/api";
import { EmbeddedWorkBox } from "../../components/EmbeddedWorkBox";
import { useAuth } from "../../context/AuthContext";
import { ConfirmDeleteModal } from "../shared/modals/ConfirmDeleteModal";
import type { OriginalArtist } from "../../types";

export interface DiscussionCommentItem {
  id: string;
  discussionPostId: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  parentId?: string | null;
  content: string;
  replyCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

/* ─── Helpers ──────────────────────────────────────────────────── */

function isUuid(val?: string | null): boolean {
  return Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
}

function extractWorkCodes(text: string): string[] {
  const matches = text.match(/#(work-[\w-]+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

function getAuthorAvatar(name?: string, avatar?: string): string {
  if (avatar && (avatar.startsWith("http") || avatar.startsWith("/"))) return avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Artist")}&background=0D0D0D&color=fff`;
}

/* ─── Clickable Artist Name ──────────────────────────────────── */

interface ArtistNameProps {
  name: string;
  authorId?: string | null;
  avatar?: string | null;
  className?: string;
  children?: React.ReactNode;
}

function ArtistName({
  name,
  authorId,
  avatar,
  className,
  children,
}: ArtistNameProps) {
  const [showProfile, setShowProfile] = useState(false);

  // If authorId is a valid UUID, use it as the target ID for backend profile modal lookup.
  const targetId = authorId && isUuid(authorId) ? authorId : (name || "Artist");
  const artistData: OriginalArtist = {
    id: targetId,
    name: name,
    userName: undefined,
    image: getAuthorAvatar(name, avatar || undefined),
    bio: "Artist",
    spirit: 0,
    works: 0,
    role: "Artist",
    socials: {},
    color_theme: "#fac107,#0f1a42",
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowProfile(true);
        }}
        className={`font-sans font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
          className || "text-[10px] text-[#e2d7c5]/90"
        } hover:text-[#f2e7d5]`}
      >
        {children || name}
      </button>
      {showProfile && (
        <ArtistProfile artist={artistData} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

/* ─── Rich Text (with work code embedding) ───────────────────── */

function RichText({ text, glowClass }: { text: string; glowClass?: string }) {
  const navigate = useNavigate();
  const workCodes = extractWorkCodes(text);
  const parts = text.split(/(#work-[\w-]+)/g);

  return (
    <div>
      <p
        className={`font-mono text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-500 ${
          glowClass || "text-white/80"
        }`}
      >
        {parts.map((part, i) => {
          if (part.startsWith("#work-")) {
            return (
              <span key={i} className="text-amber-400 font-bold mx-0.5">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {workCodes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {workCodes.map((code) => (
            <div
              key={code}
              onClick={() => navigate(`/works`)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <div className="text-[10px] font-bold uppercase text-amber-400">
                #{code}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Reply Input Form ───────────────────────────────────────── */

function ReplyForm({
  onSubmit,
  onCancel,
  placeholder = "Write a reply...",
}: {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="mt-2 mb-3 pl-1">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          maxLength={10000}
          className="w-full bg-white/[0.04] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-4 rounded-lg bg-white/5 text-white/40 text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white/60 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-8 px-4 rounded-lg bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
          >
            Cast
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── 1-Level Comment Node (With On-Demand Child Reply Fetching & Deletion) ────── */

function CommentNode({
  comment,
  setId,
  discussionId,
  currentUserId,
  currentUserName,
  onSubmitReply,
  onDeleteComment,
  depth = 0,
}: {
  comment: DiscussionCommentItem;
  setId: string;
  discussionId: string;
  currentUserId?: string;
  currentUserName?: string;
  onSubmitReply: (parentId: string, text: string) => Promise<DiscussionCommentItem | null>;
  onDeleteComment: (commentId: string) => void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [childReplies, setChildReplies] = useState<DiscussionCommentItem[]>([]);
  const [childMeta, setChildMeta] = useState<PaginationMeta | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingThis, setIsDeletingThis] = useState(false);

  const fetchChildReplies = useCallback(
    async (pageToFetch: number = 1) => {
      setLoadingReplies(true);
      try {
        const res = await apiFetch(
          `/sets/${setId}/discussions/${discussionId}/comments?parent_id=${comment.id}&page=${pageToFetch}&limit=20`
        );
        if (res.ok) {
          const json = await res.json();
          const items: DiscussionCommentItem[] = (json.data ?? []).map((c: any) => ({
            id: c.id,
            discussionPostId: c.discussionPostId || c.discussion_post_id,
            authorId: c.authorId || c.author_id,
            authorName: c.authorName || c.author_name || "Artist",
            authorAvatar: c.authorAvatar || c.author_avatar,
            parentId: c.parentId || c.parent_id,
            content: c.content || "",
            replyCount: c.replyCount ?? c.reply_count ?? 0,
            createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          }));

          if (pageToFetch === 1) {
            setChildReplies(items);
          } else {
            setChildReplies((prev) => [...prev, ...items]);
          }

          if (json.meta) {
            setChildMeta(json.meta);
          }
        }
      } catch (err) {
        console.error("[CommentNode] Failed to fetch child replies:", err);
      } finally {
        setLoadingReplies(false);
      }
    },
    [setId, discussionId, comment.id]
  );

  const handleToggleReplies = () => {
    if (!showReplies && childReplies.length === 0) {
      fetchChildReplies(1);
    }
    setShowReplies((prev) => !prev);
  };

  const handleAddReply = async (text: string) => {
    setReplyOpen(false);
    const newReply = await onSubmitReply(comment.id, text);
    if (newReply) {
      setChildReplies((prev) => [...prev, newReply]);
      setShowReplies(true);
      setReplyCount((prev) => prev + 1);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    setDeletingId(childId);
    try {
      if (isUuid(childId)) {
        await apiFetch(`/sets/delete/comment/${childId}`, { method: "DELETE" });
      }
      setChildReplies((prev) => prev.filter((c) => c.id !== childId));
      setReplyCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[CommentNode] Failed to delete child comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const authorName = comment.authorName || "Artist";
  const isCommentOwner = Boolean(
    currentUserId && comment.authorId && String(comment.authorId) === String(currentUserId)
  );

  return (
    <div className={`flex flex-col ${depth === 0 ? "border-t border-white/[0.04] pt-4 mt-3" : "pt-3 mt-1.5"}`}>
      {/* Main Comment */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <ArtistName
              name={authorName}
              authorId={comment.authorId}
              avatar={comment.authorAvatar}
              className="flex items-center gap-2"
            >
              {(() => {
                const avatar = getAuthorAvatar(authorName, comment.authorAvatar);
                return avatar ? (
                  <img
                    src={avatar}
                    className={`${depth === 0 ? "w-7 h-7" : "w-6 h-6"} rounded-md object-cover border border-white/10 flex-shrink-0`}
                    alt={authorName}
                  />
                ) : (
                  <div className={`${depth === 0 ? "w-7 h-7 text-[10px]" : "w-6 h-6 text-[9px]"} rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold flex-shrink-0`}>
                    {authorName[0]}
                  </div>
                );
              })()}
              <span className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest hover:text-[#f2e7d5] transition-colors">
                {authorName}
              </span>
            </ArtistName>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
              · {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}
            </span>
          </div>

          {/* Delete action for author */}
          {isCommentOwner && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeletingThis || deletingId === comment.id}
              title="Delete Comment"
              className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <RichText text={comment.content} />

        <div className="flex items-center gap-4 mt-2.5">
          <button
            disabled={!isUuid(comment.id)}
            onClick={() => setReplyOpen((v) => !v)}
            className={`text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              !isUuid(comment.id)
                ? "text-white/20 cursor-not-allowed"
                : replyOpen
                ? "text-white/80"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {!isUuid(comment.id) ? "Syncing..." : replyOpen ? "Cancel" : "Reply"}
          </button>

          {replyCount > 0 && (
            <button
              onClick={handleToggleReplies}
              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-500/80 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? "rotate-180" : ""}`} />
              <span>{showReplies ? "Hide replies" : `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}</span>
            </button>
          )}
        </div>

        {replyOpen && (
          <ReplyForm
            onSubmit={handleAddReply}
            onCancel={() => setReplyOpen(false)}
          />
        )}
      </div>

      {/* Nested Child Replies */}
      {showReplies && (
        <div className={`mt-2 border-l border-white/10 flex flex-col gap-2 ${depth < 3 ? "ml-4 sm:ml-5 pl-3 sm:pl-4" : "ml-2.5 pl-2.5"}`}>
          {loadingReplies && childReplies.length === 0 ? (
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono py-2">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              <span>Fetching replies...</span>
            </div>
          ) : (
            childReplies.map((child) => (
              <CommentNode
                key={child.id}
                comment={child}
                setId={setId}
                discussionId={discussionId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onSubmitReply={onSubmitReply}
                onDeleteComment={handleDeleteChild}
                depth={depth + 1}
              />
            ))
          )}

          {childMeta && childMeta.hasMore && (
            <button
              onClick={() => fetchChildReplies(childMeta.page + 1)}
              disabled={loadingReplies}
              className="text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer text-left py-1"
            >
              {loadingReplies ? "Loading..." : "Load more replies →"}
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal for Comment Deletion */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          setIsDeletingThis(true);
          try {
            await onDeleteComment(comment.id);
          } finally {
            setIsDeletingThis(false);
            setIsDeleteModalOpen(false);
          }
        }}
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        isDeleting={isDeletingThis}
      />
    </div>
  );
}

/* ─── Main Discussion Detail Page ────────────────────────────────── */

export function DiscussionPage() {
  const { setId: routeSetId, discussionId } = useParams<{ setId?: string; discussionId: string }>();
  const navigate = useNavigate();
  const { currentArtist } = useAuth();

  const [thought, setThought] = useState<any>(null);
  const [topComments, setTopComments] = useState<DiscussionCommentItem[]>([]);
  const [commentsMeta, setCommentsMeta] = useState<PaginationMeta | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [rootText, setRootText] = useState("");
  const [isPostDeleteModalOpen, setIsPostDeleteModalOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const effectiveSetId = thought?.setId || (isUuid(routeSetId) ? routeSetId : null);

  const isPostOwner = Boolean(
    currentArtist?.id &&
      thought?.authorId &&
      String(thought.authorId) === String(currentArtist.id)
  );

  const handleDeleteDiscussionPost = async () => {
    if (!discussionId) return;
    setIsDeletingPost(true);
    try {
      let deleted = false;
      if (isUuid(discussionId)) {
        const res1 = await apiFetch(`/sets/delete/discussion/${discussionId}`, { method: "DELETE" }).catch(() => null);
        if (res1?.ok) deleted = true;
      }
      if (!deleted && effectiveSetId) {
        const res2 = await apiFetch(`/sets/${effectiveSetId}/discussions/${discussionId}`, { method: "DELETE" }).catch(() => null);
        if (res2?.ok) deleted = true;
      }
      if (!deleted && effectiveSetId) {
        const res3 = await apiFetch(`/sets/${effectiveSetId}/delete/discussion/${discussionId}`, { method: "DELETE" }).catch(() => null);
        if (res3?.ok) deleted = true;
      }
      navigate(effectiveSetId ? `/sets/${effectiveSetId}` : "/sets", { replace: true });
    } catch (err) {
      console.error("[DiscussionPage] Failed to delete discussion post:", err);
    } finally {
      setIsDeletingPost(false);
      setIsPostDeleteModalOpen(false);
    }
  };

  // Stage 1: Fetch Parent Discussion Post Details
  useEffect(() => {
    if (!discussionId) return;
    setLoadingPost(true);

    const loadDiscussion = async () => {
      try {
        let postData: any = null;

        // If routeSetId is a valid UUID, call canonical endpoint
        if (routeSetId && isUuid(routeSetId)) {
          const res = await apiFetch(`/sets/${routeSetId}/discussions/${discussionId}`).catch(() => null);
          if (res && res.ok) {
            const json = await res.json();
            postData = (json && typeof json === "object" && "data" in json && json.data) ? json.data : json;
          }
        }

        // Fallback / Discovery: If routeSetId is missing/invalid or direct call failed, query /thoughts
        if (!postData || !postData.id) {
          const thoughtsRes = await apiFetch("/thoughts").catch(() => null);
          if (thoughtsRes && thoughtsRes.ok) {
            const thoughtsJson = await thoughtsRes.json();
            const list = thoughtsJson.data ?? (Array.isArray(thoughtsJson) ? thoughtsJson : []);
            const found = list.find((d: any) => String(d.id) === String(discussionId));
            if (found) {
              postData = found;
            }
          }
        }

        // Fallback 2: If routeSetId is valid UUID, check the set's discussion list
        if ((!postData || !postData.id) && routeSetId && isUuid(routeSetId)) {
          const listRes = await apiFetch(`/sets/${routeSetId}/discussions`).catch(() => null);
          if (listRes && listRes.ok) {
            const json = await listRes.json();
            const list = json.data ?? [];
            const found = Array.isArray(list) ? list.find((d: any) => String(d.id) === String(discussionId)) : null;
            if (found) {
              postData = found;
            }
          }
        }

        if (postData && (postData.id || postData.title)) {
          const resolvedSetId = postData.setId || postData.set_id || (isUuid(routeSetId) ? routeSetId : undefined);
          setThought({
            id: postData.id,
            setId: resolvedSetId,
            title: postData.title,
            content: postData.body || postData.content,
            text: postData.body || postData.content,
            authorId: postData.authorId || postData.author_id,
            authorName: postData.authorName || postData.author_name || "Artist",
            authorAvatar: postData.authorAvatar || postData.author_avatar,
            commentCount: postData.commentCount ?? postData.comment_count ?? 0,
            createdAt: postData.createdAt || postData.created_at,
            timestamp: (postData.createdAt || postData.created_at)
              ? new Date(postData.createdAt || postData.created_at).toLocaleDateString()
              : "Just now",
            work: postData.work || null,
          });

          if (resolvedSetId && (!routeSetId || !isUuid(routeSetId))) {
            navigate(`/sets/${resolvedSetId}/discussions/${discussionId}`, { replace: true });
          }
        }
      } catch (err) {
        console.error("[DiscussionPage] Failed to fetch discussion details:", err);
      } finally {
        setLoadingPost(false);
      }
    };

    loadDiscussion();
  }, [routeSetId, discussionId, navigate]);

  // Stage 2: Fetch Paginated Top-Level Comments (no parent_id)
  const fetchTopComments = useCallback(
    async (pageToFetch: number = 1) => {
      if (!effectiveSetId || !discussionId) return;
      setLoadingComments(true);
      try {
        const res = await apiFetch(
          `/sets/${effectiveSetId}/discussions/${discussionId}/comments?page=${pageToFetch}&limit=20`
        );
        if (res.ok) {
          const json = await res.json();
          const rawItems = json.data ?? (Array.isArray(json) ? json : []);
          const items: DiscussionCommentItem[] = rawItems.map((c: any) => ({
            id: c.id,
            discussionPostId: c.discussionPostId || c.discussion_post_id,
            authorId: c.authorId || c.author_id,
            authorName: c.authorName || c.author_name || "Artist",
            authorAvatar: c.authorAvatar || c.author_avatar,
            parentId: c.parentId || c.parent_id,
            content: c.content || "",
            replyCount: c.replyCount ?? c.reply_count ?? 0,
            createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          }));

          if (pageToFetch === 1) {
            setTopComments(items);
          } else {
            setTopComments((prev) => [...prev, ...items]);
          }

          if (json.meta) {
            setCommentsMeta(json.meta);
          }
        }
      } catch (err) {
        console.error("[DiscussionPage] Failed to fetch top-level comments:", err);
      } finally {
        setLoadingComments(false);
      }
    },
    [effectiveSetId, discussionId]
  );

  useEffect(() => {
    if (discussionId && effectiveSetId) {
      fetchTopComments(1);
    }
  }, [discussionId, effectiveSetId, fetchTopComments]);

  /** Called when user submits an inline reply to a comment */
  const handleSubmitReply = async (
    parentId: string,
    text: string
  ): Promise<DiscussionCommentItem | null> => {
    if (!currentArtist) {
      navigate("/profile/login");
      return null;
    }

    if (!isUuid(parentId)) {
      console.error("[DiscussionPage] Cannot reply: parent comment does not have a valid UUID yet:", parentId);
      return null;
    }

    if (!effectiveSetId || !discussionId) return null;

    const tempReplyId = `temp-${Date.now()}`;
    const optimisticReply: DiscussionCommentItem = {
      id: tempReplyId,
      discussionPostId: discussionId,
      authorId: currentArtist?.id || "user-current",
      authorName: currentArtist?.name || "YOU (ARTIST)",
      authorAvatar: currentArtist?.image,
      content: text,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      parentId: parentId,
    };

    try {
      const res = await apiFetch(`/sets/${effectiveSetId}/new/comment`, {
        method: "POST",
        body: JSON.stringify({
          discussion_id: discussionId,
          parent_id: parentId,
          content: text,
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const realCommentId = json?.comment_id || json?.data?.comment_id || json?.id;
        return {
          ...optimisticReply,
          id: realCommentId || tempReplyId,
        };
      } else {
        const errorJson = await res.json().catch(() => null);
        const errorMsg =
          errorJson?.message ||
          errorJson?.error ||
          res.apiError?.message ||
          `Failed to post reply (${res.status})`;
        console.error("[DiscussionPage] Failed to post reply:", errorMsg);
        return null;
      }
    } catch (err) {
      console.error("[DiscussionPage] Failed to post reply:", err);
      return null;
    }
  };

  /** Delete a top-level comment */
  const handleDeleteComment = async (commentId: string) => {
    setTopComments((prev) => prev.filter((c) => c.id !== commentId));
    if (thought) {
      setThought((prev: any) =>
        prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) } : prev
      );
    }
    if (isUuid(commentId)) {
      try {
        await apiFetch(`/sets/delete/comment/${commentId}`, { method: "DELETE" });
      } catch (err) {
        console.error("[DiscussionPage] Failed to delete comment:", err);
      }
    }
  };

  /** Root-level comment submit */
  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArtist) {
      navigate("/profile/login");
      return;
    }
    if (!rootText.trim() || !effectiveSetId || !discussionId) return;
    const textToPost = rootText.trim();
    const tempId = `temp-${Date.now()}`;

    const newComment: DiscussionCommentItem = {
      id: tempId,
      discussionPostId: discussionId,
      authorId: currentArtist?.id || "user-current",
      authorName: currentArtist?.name || "YOU (ARTIST)",
      authorAvatar: currentArtist?.image,
      content: textToPost,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      parentId: null,
    };

    setTopComments((prev) => [newComment, ...prev]);
    setRootText("");

    if (thought) {
      setThought((prev: any) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev
      );
    }

    try {
      const res = await apiFetch(`/sets/${effectiveSetId}/new/comment`, {
        method: "POST",
        body: JSON.stringify({
          discussion_id: discussionId,
          parent_id: null,
          content: textToPost,
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const realCommentId = json?.comment_id || json?.data?.comment_id || json?.id;
        if (realCommentId) {
          setTopComments((prev) =>
            prev.map((c) => (c.id === tempId ? { ...c, id: realCommentId } : c))
          );
        }
      } else {
        const errorJson = await res.json().catch(() => null);
        const errorMsg =
          errorJson?.message ||
          errorJson?.error ||
          res.apiError?.message ||
          `Failed to post comment (${res.status})`;
        console.error("[DiscussionPage] Failed to post comment:", errorMsg);
        // Roll back optimistic comment on failure
        setTopComments((prev) => prev.filter((c) => c.id !== tempId));
        if (thought) {
          setThought((prev: any) =>
            prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) } : prev
          );
        }
      }
    } catch (err) {
      console.error("[DiscussionPage] Failed to post comment:", err);
      setTopComments((prev) => prev.filter((c) => c.id !== tempId));
      if (thought) {
        setThought((prev: any) =>
          prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) } : prev
        );
      }
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!thought) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/30">
          Discussion Not Found
        </p>
        <button
          onClick={() => navigate(effectiveSetId ? `/sets/${effectiveSetId}` : "/sets")}
          className="text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors cursor-pointer"
        >
          ← Back to Set
        </button>
      </div>
    );
  }

  const postTitle = thought.title || "Set Discussion";
  const postBody = thought.content || thought.text;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-32">
      <DesktopHeader />
      <MobileTopHeader
        rightActions={
          <button
            onClick={() => navigate(effectiveSetId ? `/sets/${effectiveSetId}` : "/sets")}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Exit
          </button>
        }
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-2 md:mt-4 flex flex-col">
        {/* Original Post */}
        <div className="pb-6 mb-2 border-b border-white/[0.06]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-amber-500/90">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Set Discussion
              </span>
            </div>

            {isPostOwner && (
              <button
                onClick={() => setIsPostDeleteModalOpen(true)}
                disabled={isDeletingPost}
                title="Delete Discussion Post"
                className="p-1.5 px-2.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            )}
          </div>

          <h1 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-wide text-white mb-3 leading-tight">
            {postTitle}
          </h1>

          <p className="font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-5 transition-colors duration-500 text-white/90">
            {postBody}
          </p>

          {thought.work && (
            <div className="mb-5">
              <EmbeddedWorkBox work={thought.work} variant="default" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-1 pt-2 border-t border-white/[0.04]">
            <span className="text-[11px] text-white/40 mr-1">—</span>
            <ArtistName
              name={thought.authorName}
              authorId={thought.authorId}
              avatar={thought.authorAvatar}
              className="text-[11px] text-[#e2d7c5]/90 font-bold"
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              • {thought.timestamp}
            </span>
          </div>
        </div>

        {/* Root input — new top-level comment */}
        <div className="mb-6">
          {!currentArtist ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
              <p className="text-xs text-white/50 font-mono">
                Sign in to participate in this discussion and cast comments.
              </p>
              <button
                onClick={() => navigate("/profile/login")}
                className="h-8 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black uppercase tracking-widest transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleRootSubmit} className="flex flex-col gap-2">
              <textarea
                value={rootText}
                onChange={(e) => setRootText(e.target.value)}
                placeholder="Cast a new comment into the discussion…"
                rows={2}
                maxLength={10000}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleRootSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }
                }}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!rootText.trim()}
                  className="h-9 px-6 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer flex-shrink-0"
                >
                  Cast
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Paginated Top-Level Comments List */}
        <div className="flex flex-col mt-2">
          {loadingComments && topComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-white/30">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest">
                Fetching discussions…
              </span>
            </div>
          ) : topComments.length === 0 ? (
            <p className="text-center py-8 text-[11px] font-sans font-bold uppercase tracking-widest text-white/20">
              Silence in the lobby. Be the first to push a thought.
            </p>
          ) : (
            topComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                setId={effectiveSetId || ""}
                discussionId={discussionId!}
                currentUserId={currentArtist?.id}
                currentUserName={currentArtist?.name}
                onSubmitReply={handleSubmitReply}
                onDeleteComment={handleDeleteComment}
              />
            ))
          )}

          {/* Load More Top-Level Comments Button */}
          {commentsMeta && commentsMeta.hasMore && (
            <div className="pt-6 text-center">
              <button
                onClick={() => fetchTopComments(commentsMeta.page + 1)}
                disabled={loadingComments}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {loadingComments ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Comments</span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Discussion Post Deletion */}
      <ConfirmDeleteModal
        isOpen={isPostDeleteModalOpen}
        onClose={() => setIsPostDeleteModalOpen(false)}
        onConfirm={handleDeleteDiscussionPost}
        title="Delete Discussion Post?"
        description={`Are you sure you want to permanently delete "${postTitle}"? All associated comments will also be removed. This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Keep"
        isDeleting={isDeletingPost}
      />
    </div>
  );
}
