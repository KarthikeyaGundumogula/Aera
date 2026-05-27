import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, MessageSquare, Minus, Plus } from "lucide-react";
import { THOUGHTS_MOCK, MOCK_DISCUSSION_REPLIES, DiscussionReply, GRID_ITEMS, ARTISTS_MOCK } from "../../mock";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { Reactions, ReactionType } from "../shared/Reactions";
import { ArtistProfile } from "../shared/profile";

/* ─── Helpers ──────────────────────────────────────────────────── */

function extractWorkCodes(text: string): string[] {
  const matches = text.match(/#(work-[\w-]+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
}

function getAuthorAvatar(name: string): string {
  const artist = ARTISTS_MOCK.find(a => a.name.toLowerCase() === name.toLowerCase());
  if (artist?.image) return artist.image;
  
  const mockImages = ARTISTS_MOCK.filter(a => a.image).map(a => a.image!);
  if (mockImages.length > 0) {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return mockImages[hash % mockImages.length];
  }
  return "";
}

const REACTION_GLOW: Record<ReactionType, string> = {
  heart: "text-rose-200/90",
  zap: "text-yellow-200/90",
  flame: "text-orange-200/90",
  star: "text-amber-200/90",
  sparkles: "text-cyan-200/90",
};

/* ─── Clickable Artist Name ──────────────────────────────────── */

function ArtistName({ name, className }: { name: string; className?: string }) {
  const [showProfile, setShowProfile] = useState(false);
  const artistData = ARTISTS_MOCK.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  ) || ARTISTS_MOCK[0];

  const themeClasses = (artistData as any)?.themeClasses;

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
            const workId = part.slice(1);
            const work = GRID_ITEMS.find(w => w.id === workId);
            if (work) {
              return (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); navigate(`/work/${work.id}`); }}
                  className="inline-flex items-center gap-1.5 px-1.5 py-0.5 mx-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors align-middle cursor-pointer"
                >
                  <img src={work.image} className="w-4 h-4 rounded-sm object-cover inline-block" />
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
            const work = GRID_ITEMS.find(w => w.id === code);
            if (!work) return null;
            return (
              <button
                key={code}
                onClick={() => navigate(`/work/${work.id}`)}
                className="flex items-center gap-2.5 p-1.5 pr-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <img src={work.image} alt={work.title} className="w-8 h-8 rounded object-cover" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">{work.title}</span>
                  <span className="text-[8px] uppercase tracking-widest text-white/35">{work.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Inline Reply Box ───────────────────────────────────────── */

function InlineReplyBox({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagged = extractWorkCodes(text);

  // Auto-focus when it appears
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="mt-2 mb-3 pl-1">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hop in (#work-id to tag)"
          rows={2}
          className="w-full bg-white/[0.04] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as any);
          }}
        />
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1.5">
            {tagged.map((code) => {
              const work = GRID_ITEMS.find((w) => w.id === code);
              if (!work) return <span key={code} className="text-[9px] text-red-400/60 italic">#{code} not found</span>;
              return (
                <div key={code} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                  <img src={work.image} alt={work.title} className="w-4 h-4 rounded object-cover" />
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
  const [textGlow, setTextGlow] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const hasChildren = reply.replies && reply.replies.length > 0;

  if (level > MAX_DEPTH) {
    return (
      <button
        className="py-2 text-[10px] font-bold uppercase tracking-widest text-white/60 cursor-pointer hover:text-white transition-colors"
        onClick={() => {}}
      >
        Expand Sequence →
      </button>
    );
  }

  const handleReaction = (type: ReactionType) => {
    setTextGlow(REACTION_GLOW[type]);
    setTimeout(() => setTextGlow(null), 600);
  };

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
              <img src={avatar} className="w-7 h-7 rounded-md object-cover border border-white/10 flex-shrink-0" alt={reply.authorName} />
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
            <RichText text={reply.text} glowClass={textGlow || undefined} />

            <div className="flex items-center gap-3 mt-2">
              <Reactions initialReactions={reply.reactions} onReact={handleReaction} />
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
              <InlineReplyBox
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
  const [opTextGlow, setOpTextGlow] = useState<string | null>(null);

  const thought = useMemo(
    () => THOUGHTS_MOCK.find((t) => t.id === discussionId),
    [discussionId]
  );

  const initialReplies = useMemo(
    () => (discussionId ? MOCK_DISCUSSION_REPLIES[discussionId] || [] : []),
    [discussionId]
  );

  const [replies, setReplies] = useState<DiscussionReply[]>(initialReplies);
  const [rootText, setRootText] = useState("");

  const handleOpReaction = (type: ReactionType) => {
    setOpTextGlow(REACTION_GLOW[type]);
    setTimeout(() => setOpTextGlow(null), 600);
  };

  /** Called from any ThreadNode when user submits an inline reply */
  const handleSubmitReply = (parentId: string, text: string) => {
    const newReply: DiscussionReply = {
      id: `rep-user-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text,
      timestamp: "Just now",
    };

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
  const handleRootSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootText.trim()) return;
    const newReply: DiscussionReply = {
      id: `rep-user-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text: rootText.trim(),
      timestamp: "Just now",
    };
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

          <p className={`font-mono text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-4 transition-colors duration-500 ${opTextGlow || 'text-white/90'}`}>
            {thought.text}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-white/40 mr-1">—</span>
            {(() => {
              const avatar = getAuthorAvatar(thought.authorName);
              return avatar ? (
                <img src={avatar} className="w-8 h-8 rounded-md object-cover border border-white/10 flex-shrink-0" alt={thought.authorName} />
              ) : (
                <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[12px] font-bold flex-shrink-0">{thought.authorName[0]}</div>
              );
            })()}
            <ArtistName name={thought.authorName} className="text-[11px] text-[#e2d7c5]/90" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              • {thought.timestamp}
            </span>
          </div>

          <Reactions onReact={handleOpReaction} />
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
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRootSubmit(e as any);
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
