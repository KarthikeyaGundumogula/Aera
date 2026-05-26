import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { THOUGHTS_MOCK, MOCK_DISCUSSION_REPLIES, DiscussionReply } from "../../mock";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { MobileTopHeader } from "../navigation/MobileTopHeader";

export function DiscussionPage() {
  const { setId, discussionId } = useParams<{ setId: string; discussionId: string }>();
  const navigate = useNavigate();

  // Find the starting thought/discussion
  const thought = useMemo(
    () => THOUGHTS_MOCK.find((t) => t.id === discussionId),
    [discussionId]
  );

  // Initialize replies from mock database
  const initialReplies = useMemo(
    () => (discussionId ? MOCK_DISCUSSION_REPLIES[discussionId] || [] : []),
    [discussionId]
  );

  const [replies, setReplies] = useState<DiscussionReply[]>(initialReplies);
  const [newReplyText, setNewReplyText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim()) return;

    const newReply: DiscussionReply = {
      id: `rep-user-${Date.now()}`,
      authorId: "user-current",
      authorName: "YOU (ARTIST)",
      text: newReplyText.trim(),
      timestamp: "Just now",
    };

    setReplies((prev) => [...prev, newReply]);
    setNewReplyText("");
  };

  if (!thought) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/30">Discussion Not Found</p>
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
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-32">
      {/* Navigation Headers */}
      <DesktopHeader />
      <MobileTopHeader 
        rightActions={
          <button
            onClick={() => navigate(`/sets/${setId}`)}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
          >
            Exit Lobby
          </button>
        }
      />

      <main className="max-w-2xl mx-auto px-6 mt-8 md:mt-12 flex flex-col gap-10">
        {/* Back navigation button */}
        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="self-start flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Set</span>
        </button>

        {/* Lobby Headline (The original thought) */}
        <div className="relative p-8 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-white/35">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Set Lobby Discussion</span>
          </div>

          <p className="font-mono text-base md:text-lg leading-relaxed text-white/90 whitespace-pre-wrap">
            "{thought.text}"
          </p>

          <div className="flex flex-col items-end gap-1 border-t border-white/[0.03] pt-4">
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-white/70">
              - {thought.authorName}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
              {thought.timestamp}
            </span>
          </div>
        </div>

        {/* Reply Feed Container */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-grow bg-white/5" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Replies</span>
            <div className="h-px flex-grow bg-white/5" />
          </div>

          {replies.length === 0 ? (
            <p className="text-center py-6 text-[11px] font-sans font-bold uppercase tracking-widest text-white/25">
              Silence in the lobby. Be the first to push a thought.
            </p>
          ) : (
            <div className="flex flex-col gap-8 border-l border-white/5 pl-6 ml-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex flex-col gap-2 relative group">
                  {/* Thread bullet dot */}
                  <div className="absolute -left-[30px] top-[6px] w-2 h-2 rounded-full border border-white/20 bg-[#050505] group-hover:border-white/50 transition-colors" />
                  
                  <p className="font-mono text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                    "{reply.text}"
                  </p>
                  
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-white/60">
                      - {reply.authorName}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                      • {reply.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Voice Input Box */}
        <div className="border-t border-white/5 pt-8 mt-4">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <textarea
              value={newReplyText}
              onChange={(e) => setNewReplyText(e.target.value)}
              placeholder="Add your voice to this set..."
              rows={3}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!newReplyText.trim()}
              className="h-[52px] px-6 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
            >
              Push
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
