import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, MessageSquare, Minus, Plus } from "lucide-react";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { ArtistProfile } from "../shared/profile";
import { apiFetch } from "@/lib/api";

export interface DiscussionReply {
  id: string;
  authorName: string;
  authorId?: string;
  text: string;
  createdAt: string;
  timestamp?: string;
  parentId?: string;
  replies?: DiscussionReply[];
}

/* ─── Helpers ──────────────────────────────────────────────────── */

function extractWorkCodes(text: string): string[] {
  const matches = text.match(/#(work-[\w-]+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
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

  // OriginalArtist does not carry themeClasses in the data model — omit the branch
  const themeClasses = undefined;

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowProfile(true); }}
        className={`font-sans font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
          themeClasses
            ? `px-1.5 py-0.5 rounded text-[9px] ${themeClasses}`
            : `${className || "text-[10px] text-[#e2d7c5]/90"} hover:text-[#f2e7d5]`
        }`}
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
      <p className={`font-mono text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-500 ${glowClass || 'text-white/80'}`}>
        {parts.map((part, i) => {
          if (part.startsWith("#work-")) {
            const work: any = null;
            if (work) {
              return (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); navigate(`/work/${work.id}`); }}
                  className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mx-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors align-middle cursor-pointer"
                >
                  <img src={work.image} className="w-4 h-4 rounded-sm object-cover object-top inline-block" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500/90">{work.title}</span>
                </button>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </p>

      {workCodes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {workCodes.map(code => {
            const work: any = null;
            if (!work) return null;
            return (
              <div
                key={code}
                onClick={() => navigate(`/work/${work.id}`)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <img src={work.image} alt={work.title} className="w-6 h-6 rounded-lg object-cover object-top" />
                <div>
                  <div className="text-[10px] font-bold uppercase text-white/90">{work.title}</div>
                  <div className="text-[8px] font-mono text-white/40">{work.artist}</div>
                </div>
              </div>
            );
          })}
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
  const tagged = extractWorkCodes(text);

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
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit({ preventDefault: () => {} } as React.FormEvent);
          }}
        />
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1.5">
            {tagged.map((code) => {
              const work: any = null;
              if (!work) return <span key={code} className="text-[9px] text-red-400/60 italic">#{code} not found</span>;
              return (
                <div key={code} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                  <img src={work.image} alt={work.title} className="w-4 h-4 rounded object-cover object-top" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">{work.title}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-auto">
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
        </div>
      </form>
    </div>
  );
}

/* ─── Thread Node (Reddit-style) ─────────────────────────────── */

const MAX_DEPTH = 4;

function ThreadNode({
  reply,
  level = 0,
  onSubmitReply,
}: {
  reply: DiscussionReply;
  level?: number;
  onSubmitReply: (parentId: string, text: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const hasChildren = reply.replies && reply.replies.length > 0;

  if (level > MAX_DEPTH) {
    return (
      <button
        className="py-2 text-[10px] font-bold uppercase tracking-widest text-white/60 cursor-pointer hover:text-white transition-colors"
        onClick={() => {}}
      >
        Expand Discussion →
      </button>
    );
  }

  return (
    <div className={`relative flex ${level === 0 ? "border-t border-white/[0.04] pt-4 mt-2" : ""}`}>
      {/* ── Left gutter: collapse line ── */}
      <div className="flex flex-col items-center mr-3 flex-shrink-0" style={{ width: "16px" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-4 h-4 flex items-center justify-center rounded-sm text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        </button>

        {!collapsed && hasChildren && (
          <div
            className="w-px flex-grow bg-white/10 hover:bg-white/30 cursor-pointer transition-colors mt-0"
            onClick={() => setCollapsed(true)}
          />
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-grow min-w-0 pb-4">
        {/* Author line */}
        <div className="flex items-center gap-2 mb-1.5">
          {(() => {
            const avatar = getAuthorAvatar(reply.authorName);
            return avatar ? (
              <img src={avatar} className="w-7 h-7 rounded-md object-cover object-top border border-white/10 flex-shrink-0" alt={reply.authorName} />
            ) : (
              <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{reply.authorName[0]}</div>
            );
          })()}
          <ArtistName name={reply.authorName} className="text-[10px] text-[#e2d7c5]/90 font-bold tracking-widest" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
            · {reply.timestamp}
          </span>
        </div>

        {!collapsed ? (
          <>
            <RichText text={reply.text} />

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setReplyOpen((v) => !v)}
                className={`text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                  replyOpen ? "text-white/80" : "text-white/30 hover:text-white/60"
                }`}
              >
                {replyOpen ? "Cancel" : "Reply"}
              </button>
            </div>

            {/* ── Inline reply box appears right here ── */}
            {replyOpen && (
              <ReplyForm
                onSubmit={(text) => {
                  onSubmitReply(reply.id, text);
                  setReplyOpen(false);
                }}
                onCancel={() => setReplyOpen(false)}
              />
            )}

            {hasChildren && (
              <div className="mt-3 flex flex-col">
                {reply.replies!.map((child) => (
                  <ThreadNode
                    key={child.id}
                    reply={child}
                    level={level + 1}
                    onSubmitReply={onSubmitReply}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-[10px] text-white/25 italic">
            {reply.replies?.length || 0} replies collapsed
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

export function DiscussionPage() {
  const { setId, discussionId } = useParams<{ setId: string; discussionId: string }>();
  const navigate = useNavigate();

  const [thought, setThought] = useState<any>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [rootText, setRootText] = useState("");

  useEffect(() => {
    if (setId && discussionId) {
      apiFetch(`/sets/${setId}/discussions/${discussionId}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const data = json.data || json;
            setThought(data.discussion || data);
            setReplies(data.comments || []);
          }
        })
        .catch(() => {});
    }
  }, [setId, discussionId]);

  /** Called from any ThreadNode when user submits an inline reply */
  const handleSubmitReply = async (parentId: string, text: string) => {
    const newReply: DiscussionReply = {
      id: `rep-user-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
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
      } catch {
        // Fallback state update
      }
    }

    const addReplyRecursively = (nodes: DiscussionReply[]): DiscussionReply[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, replies: [...(node.replies || []), newReply] };
        }
        if (node.replies) {
          return { ...node, replies: addReplyRecursively(node.replies) };
        }
        return node;
      });

    setReplies((prev) => addReplyRecursively(prev));
  };

  /** Root-level new thought submit */
  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootText.trim()) return;
    const textToPost = rootText.trim();
    const newReply: DiscussionReply = {
      id: `rep-user-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text: textToPost,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
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
      } catch {
        // Fallback state update
      }
    }

    setReplies((prev) => [...prev, newReply]);
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

        {/* ── Original Post ── */}
        <div className="pb-6 mb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/35 mb-4">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Set Discussion
            </span>
          </div>

          <p className="font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-4 transition-colors duration-500 text-white/90">
            {thought.text}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/40 mr-1">—</span>
            {(() => {
              const avatar = getAuthorAvatar(thought.authorName);
              return avatar ? (
                <img src={avatar} className="w-8 h-8 rounded-md object-cover object-top border border-white/10 flex-shrink-0" alt={thought.authorName} />
              ) : (
                <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[12px] font-bold flex-shrink-0">{thought.authorName[0]}</div>
              );
            })()}
            <ArtistName name={thought.authorName} className="text-[11px] text-[#e2d7c5]/90" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              • {thought.timestamp}
            </span>
          </div>
        </div>

        {/* ── Root input — start a new thread ── */}
        <div className="mb-6">
          <form onSubmit={handleRootSubmit} className="flex flex-col gap-2">
            <textarea
              value={rootText}
              onChange={(e) => setRootText(e.target.value)}
              placeholder="Cast a new thought into the discussion…"
              rows={2}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRootSubmit({ preventDefault: () => {} } as React.FormEvent);
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

        {/* ── Thread ── */}
        <div className="flex flex-col mt-2">
          {replies.length === 0 ? (
            <p className="text-center py-8 text-[11px] font-sans font-bold uppercase tracking-widest text-white/20">
              Silence in the lobby. Be the first to push a thought.
            </p>
          ) : (
            replies.map((reply) => (
              <ThreadNode
                key={reply.id}
                reply={reply}
                onSubmitReply={handleSubmitReply}
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
}
