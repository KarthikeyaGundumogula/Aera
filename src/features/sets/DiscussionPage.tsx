import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { ArtistProfile } from "../shared/profile";
import { apiFetch } from "@/lib/api";
import { EmbeddedWorkBox } from "../../components/EmbeddedWorkBox";

export interface DiscussionReply {
  id: string;
  authorName: string;
  authorId?: string;
  text: string;
  createdAt: string;
  timestamp?: string;
  parentId?: string | null;
  work?: any;
  taggedWorkId?: string;
  replies?: DiscussionReply[];
}

/* ─── Helpers ──────────────────────────────────────────────────── */

function extractWorkCodes(text: string): string[] {
  const matches = text.match(/#(work-[\w-]+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

function getAuthorAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D0D0D&color=fff`;
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

/* ─── 1-Level Comment Node (Immediate Children Only) ─────────────── */

function CommentNode({
  comment,
  onSubmitReply,
}: {
  comment: DiscussionReply;
  onSubmitReply: (parentId: string, text: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const hasChildren = comment.replies && comment.replies.length > 0;

  return (
    <div className="border-t border-white/[0.04] pt-4 mt-3 flex flex-col">
      {/* Main Comment */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {(() => {
            const avatar = getAuthorAvatar(comment.authorName);
            return avatar ? (
              <img
                src={avatar}
                className="w-7 h-7 rounded-md object-cover border border-white/10 flex-shrink-0"
                alt={comment.authorName}
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {comment.authorName[0]}
              </div>
            );
          })()}
          <ArtistName
            name={comment.authorName}
            className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest"
          />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
            · {comment.timestamp || "Just now"}
          </span>
        </div>

        <RichText text={comment.text} />

        {(comment.work || comment.taggedWorkId) && (
          <div className="mt-3 w-full max-w-lg">
            <EmbeddedWorkBox
              work={comment.work}
              workId={comment.taggedWorkId}
              variant="default"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mt-2.5">
          <button
            onClick={() => setReplyOpen((v) => !v)}
            className={`text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              replyOpen ? "text-white/80" : "text-white/30 hover:text-white/60"
            }`}
          >
            {replyOpen ? "Cancel" : "Reply"}
          </button>
        </div>

        {replyOpen && (
          <ReplyForm
            onSubmit={(text) => {
              onSubmitReply(comment.id, text);
              setReplyOpen(false);
            }}
            onCancel={() => setReplyOpen(false)}
          />
        )}
      </div>

      {/* Immediate 1-Level Child Replies */}
      {hasChildren && (
        <div className="ml-5 mt-3 pl-4 border-l border-white/10 flex flex-col gap-3">
          {comment.replies!.map((child) => (
            <div key={child.id} className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const avatar = getAuthorAvatar(child.authorName);
                  return avatar ? (
                    <img
                      src={avatar}
                      className="w-6 h-6 rounded-md object-cover border border-white/10 flex-shrink-0"
                      alt={child.authorName}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {child.authorName[0]}
                    </div>
                  );
                })()}
                <ArtistName
                  name={child.authorName}
                  className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest"
                />
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                  · {child.timestamp || "Just now"}
                </span>
              </div>
              <RichText text={child.text} />
              {(child.work || child.taggedWorkId) && (
                <div className="mt-2 w-full max-w-md">
                  <EmbeddedWorkBox
                    work={child.work}
                    workId={child.taggedWorkId}
                    variant="compact"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Discussion Detail Page ────────────────────────────────── */

export function DiscussionPage() {
  const { setId, discussionId } = useParams<{ setId: string; discussionId: string }>();
  const navigate = useNavigate();

  const [thought, setThought] = useState<any>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [rootText, setRootText] = useState("");

  useEffect(() => {
    if (setId && discussionId) {
      apiFetch(`/sets/${setId}/discussions`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
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
                  createdAt: found.createdAt || found.created_at,
                  timestamp: (found.createdAt || found.created_at)
                    ? new Date(found.createdAt || found.created_at).toLocaleDateString()
                    : "Just now",
                  work: found.work || null,
                });
                if (found.comments && Array.isArray(found.comments)) {
                  setReplies(
                    found.comments.map((c: any) => ({
                      id: c.id,
                      authorName: c.author_name || c.authorName || "Artist",
                      authorId: c.author_id || c.authorId,
                      text: c.content || c.text || "",
                      createdAt: c.created_at || c.createdAt || new Date().toISOString(),
                      timestamp: (c.created_at || c.createdAt)
                        ? new Date(c.created_at || c.createdAt).toLocaleDateString()
                        : "Just now",
                      parentId: c.parent_id || c.parentId || null,
                      work: c.work || null,
                    }))
                  );
                }
              }
            }
          }
        })
        .catch((err) => {
          console.error("[DiscussionPage] Failed to fetch discussion details:", err);
        });
    }
  }, [setId, discussionId]);

  // Group flat comments into top-level comments and 1-level immediate children ONLY
  const formattedComments = useMemo(() => {
    const topLevel: DiscussionReply[] = [];
    const childrenMap: Record<string, DiscussionReply[]> = {};

    replies.forEach((r) => {
      if (!r.parentId || String(r.parentId) === String(discussionId)) {
        topLevel.push({ ...r, replies: [] });
      } else {
        const pId = String(r.parentId);
        if (!childrenMap[pId]) {
          childrenMap[pId] = [];
        }
        childrenMap[pId].push(r);
      }
    });

    topLevel.forEach((parent) => {
      parent.replies = childrenMap[parent.id] || [];
    });

    return topLevel;
  }, [replies, discussionId]);

  /** Called when user submits an inline reply to a comment */
  const handleSubmitReply = async (parentId: string, text: string) => {
    const newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
      parentId: parentId,
    };

    if (setId && discussionId) {
      try {
        await apiFetch(`/sets/${setId}/new/comment`, {
          method: "POST",
          body: JSON.stringify({
            discussion_id: discussionId,
            parent_id: parentId.startsWith("rep-") ? null : parentId,
            content: text,
          }),
        });
      } catch (err) {
        console.error("[DiscussionPage] Failed to post reply:", err);
      }
    }

    setReplies((prev) => [...prev, newReply]);
  };

  /** Root-level comment submit */
  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootText.trim()) return;
    const textToPost = rootText.trim();
    const newComment: DiscussionReply = {
      id: `rep-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text: textToPost,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
      parentId: null,
    };

    if (setId && discussionId) {
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
    }

    setReplies((prev) => [...prev, newComment]);
    setRootText("");
  };

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

        {/* 1-Level Comments List */}
        <div className="flex flex-col mt-2">
          {formattedComments.length === 0 ? (
            <p className="text-center py-8 text-[11px] font-sans font-bold uppercase tracking-widest text-white/20">
              Silence in the lobby. Be the first to push a thought.
            </p>
          ) : (
            formattedComments.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                onSubmitReply={handleSubmitReply}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
