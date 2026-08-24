import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { ArtistProfile } from "../shared/profile";
import { apiFetch } from "@/lib/api";
import { EmbeddedWorkBox } from "../../components/EmbeddedWorkBox";
import { useAuth } from "../../context/AuthContext";

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

function extractWorkCodes(text: string): string[] {
  const matches = text.match(/#(work-[\w-]+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

function getAuthorAvatar(name?: string, avatar?: string): string {
  if (avatar && (avatar.startsWith("http") || avatar.startsWith("/"))) return avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Artist")}&background=0D0D0D&color=fff`;
}

/* ─── Clickable Artist Name ──────────────────────────────────── */

function ArtistName({ name, className }: { name: string; className?: string }) {
  const [showProfile, setShowProfile] = useState(false);
  const artistData = {
    id: "fh-001",
    name: name,
    image: getAuthorAvatar(name),
    bio: "Artist",
    spirit: 0,
    works: 0,
    role: "Artist",
    socials: {},
    colorTheme: "#fac107,#0f1a42",
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowProfile(true);
        }}
        className={`font-sans font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
          className || "text-[10px] text-[#e2d7c5]/90"
        } hover:text-[#f2e7d5]`}
      >
        {name}
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
}: {
  comment: DiscussionCommentItem;
  setId: string;
  discussionId: string;
  currentUserId?: string;
  currentUserName?: string;
  onSubmitReply: (parentId: string, text: string) => void;
  onDeleteComment: (commentId: string, parentId?: string | null) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [childReplies, setChildReplies] = useState<DiscussionCommentItem[]>([]);
  const [childMeta, setChildMeta] = useState<PaginationMeta | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);

  const fetchChildReplies = useCallback(
    async (pageToFetch: number = 1) => {
      setLoadingReplies(true);
      try {
        const res = await apiFetch(
          `/sets/${setId}/discussions/${discussionId}/comments?parent_id=${comment.id}&page=${pageToFetch}&limit=20`
        );
        if (res.ok) {
          const json = await res.json();
          const items: DiscussionCommentItem[] = (json.data || []).map((c: any) => ({
            id: c.id,
            discussionPostId: c.discussionPostId || c.discussion_post_id,
            authorId: c.authorId || c.author_id,
            authorName: c.authorName || c.author_name || "Artist",
            authorAvatar: c.authorAvatar || c.author_avatar,
            parentId: c.parentId || c.parent_id,
            content: c.content || c.text || "",
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

  const handleAddReply = (text: string) => {
    onSubmitReply(comment.id, text);
    setReplyCount((prev) => prev + 1);
    setReplyOpen(false);
  };

  const handleDeleteChild = async (childId: string) => {
    setDeletingId(childId);
    try {
      await apiFetch(`/sets/delete/comment/${childId}`, { method: "DELETE" });
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
    <div className="border-t border-white/[0.04] pt-4 mt-3 flex flex-col">
      {/* Main Comment */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {(() => {
              const avatar = getAuthorAvatar(authorName, comment.authorAvatar);
              return avatar ? (
                <img
                  src={avatar}
                  className="w-7 h-7 rounded-md object-cover border border-white/10 flex-shrink-0"
                  alt={authorName}
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {authorName[0]}
                </div>
              );
            })()}
            <ArtistName
              name={authorName}
              className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest"
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
              · {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Just now"}
            </span>
          </div>

          {/* Delete action for author */}
          {isCommentOwner && (
            <button
              onClick={() => onDeleteComment(comment.id, comment.parentId)}
              title="Delete Comment"
              className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <RichText text={comment.content} />

        <div className="flex items-center gap-4 mt-2.5">
          <button
            onClick={() => setReplyOpen((v) => !v)}
            className={`text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              replyOpen ? "text-white/80" : "text-white/30 hover:text-white/60"
            }`}
          >
            {replyOpen ? "Cancel" : "Reply"}
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

      {/* Immediate 1-Level Child Replies */}
      {showReplies && (
        <div className="ml-5 mt-3 pl-4 border-l border-white/10 flex flex-col gap-3">
          {loadingReplies && childReplies.length === 0 ? (
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono py-2">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              <span>Fetching replies...</span>
            </div>
          ) : (
            childReplies.map((child) => {
              const childAuthor = child.authorName || "Artist";
              const isChildOwner = Boolean(
                currentUserId && child.authorId && String(child.authorId) === String(currentUserId)
              );

              return (
                <div key={child.id} className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const avatar = getAuthorAvatar(childAuthor, child.authorAvatar);
                        return avatar ? (
                          <img
                            src={avatar}
                            className="w-6 h-6 rounded-md object-cover border border-white/10 flex-shrink-0"
                            alt={childAuthor}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                            {childAuthor[0]}
                          </div>
                        );
                      })()}
                      <ArtistName
                        name={childAuthor}
                        className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest"
                      />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                        · {child.createdAt ? new Date(child.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>

                    {isChildOwner && (
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        disabled={deletingId === child.id}
                        title="Delete Reply"
                        className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        {deletingId === child.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <RichText text={child.content} />
                </div>
              );
            })
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
    </div>
  );
}

/* ─── Main Discussion Detail Page ────────────────────────────────── */

export function DiscussionPage() {
  const { setId, discussionId } = useParams<{ setId: string; discussionId: string }>();
  const navigate = useNavigate();
  const { currentArtist } = useAuth();

  const [thought, setThought] = useState<any>(null);
  const [topComments, setTopComments] = useState<DiscussionCommentItem[]>([]);
  const [commentsMeta, setCommentsMeta] = useState<PaginationMeta | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [rootText, setRootText] = useState("");

  // Stage 1: Fetch Parent Discussion Post Details
  useEffect(() => {
    if (!setId || !discussionId) return;
    setLoadingPost(true);

    apiFetch(`/sets/${setId}/discussions/${discussionId}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setThought({
            id: data.id,
            title: data.title,
            content: data.body || data.content,
            text: data.body || data.content,
            authorName: data.authorName || data.author_name || "Artist",
            authorAvatar: data.authorAvatar || data.author_avatar,
            commentCount: data.commentCount ?? data.comment_count ?? 0,
            createdAt: data.createdAt || data.created_at,
            timestamp: (data.createdAt || data.created_at)
              ? new Date(data.createdAt || data.created_at).toLocaleDateString()
              : "Just now",
            work: data.work || null,
          });
        } else {
          // Fallback: list search if single endpoint is not supported
          const listRes = await apiFetch(`/sets/${setId}/discussions`).catch(() => null);
          if (listRes && listRes.ok) {
            const json = await listRes.json();
            const list = json.data || json;
            if (Array.isArray(list)) {
              const found = list.find((d: any) => String(d.id) === String(discussionId));
              if (found) {
                setThought({
                  id: found.id,
                  title: found.title,
                  content: found.body || found.content,
                  text: found.body || found.content,
                  authorName: found.authorName || found.author_name || "Artist",
                  authorAvatar: found.authorAvatar || found.author_avatar,
                  commentCount: found.commentCount ?? found.comment_count ?? 0,
                  createdAt: found.createdAt || found.created_at,
                  timestamp: (found.createdAt || found.created_at)
                    ? new Date(found.createdAt || found.created_at).toLocaleDateString()
                    : "Just now",
                  work: found.work || null,
                });
              }
            }
          }
        }
      })
      .catch((err) => {
        console.error("[DiscussionPage] Failed to fetch discussion details:", err);
      })
      .finally(() => {
        setLoadingPost(false);
      });
  }, [setId, discussionId]);

  // Stage 2: Fetch Paginated Top-Level Comments (no parent_id)
  const fetchTopComments = useCallback(
    async (pageToFetch: number = 1) => {
      if (!setId || !discussionId) return;
      setLoadingComments(true);
      try {
        const res = await apiFetch(
          `/sets/${setId}/discussions/${discussionId}/comments?page=${pageToFetch}&limit=20`
        );
        if (res.ok) {
          const json = await res.json();
          const items: DiscussionCommentItem[] = (json.data || []).map((c: any) => ({
            id: c.id,
            discussionPostId: c.discussionPostId || c.discussion_post_id,
            authorId: c.authorId || c.author_id,
            authorName: c.authorName || c.author_name || "Artist",
            authorAvatar: c.authorAvatar || c.author_avatar,
            parentId: c.parentId || c.parent_id,
            content: c.content || c.text || "",
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
    [setId, discussionId]
  );

  useEffect(() => {
    if (discussionId) {
      fetchTopComments(1);
    }
  }, [discussionId, fetchTopComments]);

  /** Called when user submits an inline reply to a comment */
  const handleSubmitReply = async (parentId: string, text: string) => {
    const newReply: DiscussionCommentItem = {
      id: `rep-${Date.now()}`,
      discussionPostId: discussionId!,
      authorId: currentArtist?.id || "user-current",
      authorName: currentArtist?.name || "YOU (ARTIST)",
      content: text,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      parentId: parentId,
    };

    if (setId && discussionId) {
      try {
        await apiFetch(`/sets/${setId}/new/comment`, {
          method: "POST",
          body: JSON.stringify({
            discussion_id: discussionId,
            parent_id: parentId,
            content: text,
          }),
        });
      } catch (err) {
        console.error("[DiscussionPage] Failed to post reply:", err);
      }
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
    try {
      await apiFetch(`/sets/delete/comment/${commentId}`, { method: "DELETE" });
    } catch (err) {
      console.error("[DiscussionPage] Failed to delete comment:", err);
    }
  };

  /** Root-level comment submit */
  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootText.trim() || !setId || !discussionId) return;
    const textToPost = rootText.trim();

    const newComment: DiscussionCommentItem = {
      id: `rep-${Date.now()}`,
      discussionPostId: discussionId,
      authorId: currentArtist?.id || "user-current",
      authorName: currentArtist?.name || "YOU (ARTIST)",
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
      await apiFetch(`/sets/${setId}/new/comment`, {
        method: "POST",
        body: JSON.stringify({
          discussion_id: discussionId,
          parent_id: null,
          content: textToPost,
        }),
      });
    } catch (err) {
      console.error("[DiscussionPage] Failed to post comment:", err);
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
          onClick={() => navigate(setId ? `/sets/${setId}` : "/sets")}
          className="text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
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
            onClick={() => navigate(`/sets/${setId}`)}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
          >
            Exit
          </button>
        }
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-2 md:mt-4 flex flex-col">
        {/* Original Post */}
        <div className="pb-6 mb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-amber-500/90 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              Set Discussion
            </span>
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
              className="text-[11px] text-[#e2d7c5]/90 font-bold"
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              • {thought.timestamp}
            </span>
          </div>
        </div>

        {/* Root input — new top-level comment */}
        <div className="mb-6">
          <form onSubmit={handleRootSubmit} className="flex flex-col gap-2">
            <textarea
              value={rootText}
              onChange={(e) => setRootText(e.target.value)}
              placeholder="Cast a new comment into the discussion…"
              rows={2}
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
                setId={setId!}
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
    </div>
  );
}
