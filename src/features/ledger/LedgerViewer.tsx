/**
 * LedgerViewer.tsx
 *
 * Full-screen editorial view for a single Ledger entry.
 * Layout inspired by a premium broadsheet / cinematic magazine spread.
 *
 * URL: /ledger/:id
 * Shareable: yes — the URL itself is the share target.
 *
 * Desktop layout (grid, lg+):
 *   ┌─────────────────────────────────────────────────────────┐
 *   │                  BANNER (poster full-width)             │
 *   ├─────────────────────────────────┬───────────────────────┤
 *   │  HEADLINE (preThoughts or       │  SIDEBAR              │
 *   │  artist byline if null)         │  • Star               │
 *   │                                 │  • Makers (dir/music) │
 *   │  POST BODY (afterThoughts)      │  • Genre chips        │
 *   │                                 │                       │
 *   │  SURGE BLOCK                    │                       │
 *   └─────────────────────────────────┴───────────────────────┘
 *
 * Mobile layout (<lg):
 *   Newspaper broadsheet style —
 *   • Pre-thoughts wrap full-width on line 1; float-right maker
 *     column hugs the right from line 2 onward.
 *   • After-thoughts body has a drop-cap first letter.
 *   • Compact surge score runs inline after the body.
 *   • Stars & Makers horizontal carousel at the bottom (no heading).
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Share2, Check, BookPlus, Eye, Clock, Edit3, Sparkles } from "lucide-react";
import type { LedgerItem, LedgerMakerCredit } from "@/types/ledger";
import { SurgeBars } from "../../components/SurgeBars";
import { SurgeScoreDisplay } from "../../components/surge/SurgeScoreDisplay";
import { SurgeInputSection } from "../../components/surge/SurgeInputSection";
import { ArtistAvatar } from "@/components/ArtistAvatar";
import { PosterImage } from "@/components/PosterImage";
import { useAuth } from "../../context/AuthContext";

// ─── Easing constant (strong ease-out per Emil design-eng principles) ──────────
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const PROFILE_NAME_GRADIENTS: Record<string, [string, string]> = {
  "fh-001": ["#334155", "#64748b"],
  "profile-karthik-g": ["#334155", "#64748b"],
  "fh-002": ["#78350f", "#f59e0b"],
  "profile-priya-nair": ["#78350f", "#f59e0b"],
  "fh-003": ["#7f1d1d", "#ef4444"],
  "profile-arjun-reddy": ["#7f1d1d", "#ef4444"],
  "profile-pawan-kalyan": ["#b91c1c", "#ef4444"],
  "profile-ram-charan": ["#737373", "#e5e5e5"],
};

function getAuthorThemeGradient(artistId?: string): [string, string] {
  if (!artistId) return ["#334155", "#64748b"];
  if (PROFILE_NAME_GRADIENTS[artistId]) return PROFILE_NAME_GRADIENTS[artistId];
  // If artistId is a raw color_theme string ("#hex1,#hex2"), parse it directly
  if (artistId.includes(",")) {
    const parts = artistId.split(",").map((s) => s.trim());
    if (parts.length >= 2) return [parts[0], parts[1]] as [string, string];
  }
  return ["#334155", "#64748b"];
}

// ─── Surge Score counter animation ───────────────────────────────────────────

function useSurgeCount(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;
    startTime.current = null;

    const tick = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return count;
}

// ─── Sidebar credit row (desktop only) ───────────────────────────────────────

function CreditRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-white/[0.06] last:border-0">
      <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30">
        {label}
      </span>
      <span className="text-[12px] font-bold text-white/80 leading-snug">
        {value}
      </span>
    </div>
  );
}

// ─── Headline line splitter helper ──────────────────────────────────────────
// Splits headline text so Line 1 is rendered BEFORE the MakerCard float in DOM
// (forcing Line 1 to span 100% full-width edge-to-edge), while Line 2+ is
// rendered AFTER the float (wrapping to its left).

function splitHeadline(text: string): { line1: string; rest: string } {
  if (!text) return { line1: "", rest: "" };

  const sentenceMatch = text.slice(0, 55).match(/^([^.!?]+[.!?])\s*(.*)/);
  if (sentenceMatch && sentenceMatch[1].length >= 12) {
    const line1 = sentenceMatch[1];
    const rest = text.slice(line1.length);
    return { line1, rest };
  }

  if (text.length <= 38) {
    return { line1: text, rest: "" };
  }

  const spaceIndex = text.indexOf(" ", 32);
  if (spaceIndex !== -1 && spaceIndex < 50) {
    return {
      line1: text.slice(0, spaceIndex),
      rest: text.slice(spaceIndex),
    };
  }

  const fallbackSpace = text.indexOf(" ", 24);
  if (fallbackSpace !== -1) {
    return {
      line1: text.slice(0, fallbackSpace),
      rest: text.slice(fallbackSpace),
    };
  }

  return { line1: text, rest: "" };
}

// ─── Mobile: Maker card content ─────────────────────────────────────────────

function MakerCardContent({ entry }: { entry: LedgerItem }) {
  const primaryMaker: LedgerMakerCredit | null = entry.makers?.[0] ?? null;

  const imageUrl = primaryMaker?.imageUrl ?? entry.starImageUrl ?? null;
  const displayName = primaryMaker?.name ?? entry.starName ?? null;
  const displayRole = primaryMaker?.role ?? "Star";

  if (!imageUrl && !displayName) return null;

  return (
    <>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={displayName ?? displayRole}
          className="w-full aspect-[3/4] object-cover object-top rounded-sm border border-white/[0.08]"
          loading="lazy"
        />
      )}
      {displayName && (
        <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/60 mt-1.5 text-center leading-tight line-clamp-1">
          {displayName}
        </p>
      )}
      <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-white/25 text-center mt-0.5">
        {displayRole}
      </p>
    </>
  );
}

// ─── Mobile: Compact Surge Score (inline / in-flow) ──────────────────────────

interface MobileSurgeProps {
  surgeCount: number;
  surgeScore: number;
  peakScore: number;
  peakSnapshot?: number;
  currentPeakScore?: number;
}

function MobileSurgeScore({ surgeCount, peakScore, peakSnapshot, currentPeakScore }: MobileSurgeProps) {
  const effectiveSnapshotPeak = peakSnapshot || peakScore || 1000;
  return (
    <div className="pt-6 border-t border-white/[0.05]">
      <SurgeScoreDisplay
        surgeScore={surgeCount}
        peakSnapshot={effectiveSnapshotPeak}
        currentPeakScore={currentPeakScore}
        size="sm"
      />
    </div>
  );
}

// ─── SVG Drop Cap component ─────────────────────────────────────────────────
// Renders the first letter using an inline SVG with the profile's theme gradient.
// SVG height 44px precisely spans the 2-line body height (line 1 cap to line 2 baseline).

function DropCapSVG({ letter, artistId }: { letter: string; artistId?: string }) {
  const [stop1, stop2] = getAuthorThemeGradient(artistId);
  const gradId = `dropCapGrad-${letter.charCodeAt(0)}-${(artistId ?? "default").replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <span className="float-left mr-2.5 select-none block mt-0.5">
      <svg
        width="34"
        height="44"
        viewBox="0 0 34 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stop1} />
            <stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="37"
          textAnchor="middle"
          fill={`url(#${gradId})`}
          fontSize="44"
          fontWeight="900"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          {letter}
        </text>
      </svg>
    </span>
  );
}

// ─── Mobile: Two distinct Identity Card rows (Makers & Stars) ───────────────

interface IdentityCardsProps {
  entry: LedgerItem;
}

function IdentityCardsSections({ entry }: IdentityCardsProps) {
  const navigate = useNavigate();

  // Build Makers List
  type PersonCard = { name: string; role: string; imageUrl?: string };
  const makersList: PersonCard[] = [];

  // Add makers from entry.makerCredits
  entry.makerCredits?.forEach((m) => {
    if (!makersList.some((x) => x.name === m.artistStageName)) {
      makersList.push({ name: m.artistStageName || "", role: m.role, imageUrl: m.artistPic });
    }
  });

  // Build Stars List
  const starsList: PersonCard[] = [];

  if (entry.starName) {
    starsList.push({
      name: entry.starName,
      role: "Lead Star",
      imageUrl: entry.starImageUrl,
    });
  }

  if (makersList.length === 0 && starsList.length === 0) return null;

  return (
    <div className="space-y-5 px-5">
      {/* ── MAKERS ROW ────────────────────────────────────────────── */}
      {makersList.length > 0 && (
        <div className="space-y-2">
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30">
            Makers
          </p>
          <div
            className="flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {makersList.map((person, i) => (
              <motion.div
                key={`maker-${person.name}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.05,
                  duration: 0.4,
                  ease: EASE_OUT,
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/profile/${encodeURIComponent(person.name)}`);
                  }
                }}
                onClick={() => navigate(`/profile/${encodeURIComponent(person.name)}`)}
                className="flex-shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer group w-[165px]"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05] border border-white/10">
                  {person.imageUrl ? (
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-black">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/30 leading-none mb-0.5 truncate">
                    {person.role}
                  </p>
                  <p className="text-[10px] font-bold text-white/80 group-hover:text-white truncate leading-snug">
                    {person.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── STARS ROW ─────────────────────────────────────────────── */}
      {starsList.length > 0 && (
        <div className="space-y-2">
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30">
            Stars
          </p>
          <div
            className="flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {starsList.map((person, i) => (
              <motion.div
                key={`star-${person.name}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + i * 0.05,
                  duration: 0.4,
                  ease: EASE_OUT,
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/profile/${encodeURIComponent(person.name)}`);
                  }
                }}
                onClick={() => navigate(`/profile/${encodeURIComponent(person.name)}`)}
                className="flex-shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer group w-[165px]"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05] border border-white/10">
                  {person.imageUrl ? (
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-black">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/30 leading-none mb-0.5 truncate">
                    {person.role}
                  </p>
                  <p className="text-[10px] font-bold text-white/80 group-hover:text-white truncate leading-snug">
                    {person.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── In-Place Breakdown Editor Component ─────────────────────────────────────

function InPlaceBreakdownEditor({
  entryStatus,
  preThoughts,
  afterThoughts,
  surgeScore,
  savedSuccess,
  setPreThoughts,
  setAfterThoughts,
  setSurgeScore,
  handleStatusChangeInViewer,
  handleSaveInPlace,
  setIsEditing,
}: {
  entryStatus: "watched" | "want_to_watch";
  preThoughts: string;
  afterThoughts: string;
  surgeScore: number;
  savedSuccess: boolean;
  setPreThoughts: (val: string) => void;
  setAfterThoughts: (val: string) => void;
  setSurgeScore: (val: number) => void;
  handleStatusChangeInViewer: (status: "watched" | "want_to_watch") => void;
  handleSaveInPlace: () => void;
  setIsEditing: (val: boolean) => void;
}) {
  const peakMagnitude = 10000;
  const pctScore = Math.min(Math.round((surgeScore / peakMagnitude) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-6 bg-white/[0.02] border-b border-white/[0.08]"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Edit Experience & Breakdown
        </span>
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Check className="w-4 h-4" /> Breakdown Saved!
          </span>
        )}
      </div>

      {/* Status Selector Switcher */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          Watching Status
        </label>
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 w-fit border border-white/10">
          <button
            onClick={() => handleStatusChangeInViewer("watched")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              entryStatus === "watched"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Eye className="w-3 h-3" />
            Watched
          </button>
          <button
            onClick={() => handleStatusChangeInViewer("want_to_watch")}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              entryStatus === "want_to_watch"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Clock className="w-3 h-3" />
            Plan to Watch
          </button>
        </div>
      </div>

      {/* Pre-watching Expectations Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
          Pre-Watching Expectations
        </label>
        <textarea
          value={preThoughts}
          onChange={(e) => setPreThoughts(e.target.value)}
          placeholder="What were your thoughts before watching?"
          rows={3}
          className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 resize-none font-serif leading-relaxed"
        />
      </div>

      {/* Post-watching Breakdown Input (only when watched) */}
      {entryStatus === "watched" && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
            Post-Watching Breakdown
          </label>
          <textarea
            value={afterThoughts}
            onChange={(e) => setAfterThoughts(e.target.value)}
            placeholder="Log your reflection, thoughts, and post-watching breakdown..."
            rows={5}
            className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 resize-none font-serif leading-relaxed"
          />
        </div>
      )}

      {/* Surge Score Component (when watched) — Placed AFTER pre & post text inputs */}
      {entryStatus === "watched" && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Surge Resonance Score
          </label>
          <SurgeInputSection
            score={surgeScore}
            peak={10000}
            onChange={setSurgeScore}
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSaveInPlace}
          className="py-3 px-6 rounded-xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
        >
          Save Breakdown
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black uppercase text-[10px] tracking-wider hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { apiFetch } from "@/lib/api";

export function LedgerViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [remoteEntry, setRemoteEntry] = useState<LedgerItem | null>(null);
  const { currentArtist } = useAuth();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiFetch(`/library/entry/${id}`)
      .then(async (res) => {
        if (!res.ok || !isMounted) return;
        const json = await res.json().catch(() => ({}));
        const item = json.data || json;
        if (!item || !item.id) return;

        const st = String(item.status || "").toLowerCase();
        setRemoteEntry({
          id: item.id,
          artistId: item.artistId || (item.originalId ? "" : "fh-001"),
          originalId: item.originalId,
          originalName: item.originalName || "Original",
          originalPosterUrl: item.originalPosterUrl || "",
          releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : "2026",
          genre: Array.isArray(item.genre) ? item.genre : [item.genre || "Drama"],
          starName: "",
          status: st.includes("want") || st.includes("plan") ? "want_to_watch" : "watched",
          preThoughts: item.userHypeThought || item.preThoughts || "",
          afterThoughts: item.userAfterThought || item.afterThoughts || "",
          surgeScore: item.surgeScore || 0,
          peakScore: item.peakScore || 1000,
          peakSnapshot: item.peakSnapshot ?? item.peak_snapshot ?? item.peakScore ?? 1000,
          currentPeakScore: item.currentPeakScore ?? item.current_peak_score ?? 1000,
          taggedWorks: item.taggedWorks || [],
          addedAt: item.addedAt || new Date().toISOString(),
          artistStageName: item.artistStageName || "",
          artistProfilePicture: item.artistProfilePicture || "",
          artistColorTheme: item.artistColorTheme || "",
        });
      })
      .catch((err) => {
        console.error("[LedgerViewer] Failed to fetch entry details:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const entry: LedgerItem | undefined = remoteEntry || undefined;
  const currentArtistId = currentArtist?.id || "fh-001";
  const isOwner = Boolean(entry && (!entry.artistId || entry.artistId === currentArtistId || entry.artistId === "fh-001"));

  const [isEditing, setIsEditing] = useState<boolean>(
    searchParams.get("edit") === "true" && isOwner
  );
  const [entryStatus, setEntryStatus] = useState<"watched" | "want_to_watch">(
    entry?.status ?? "want_to_watch"
  );
  const [preThoughts, setPreThoughts] = useState<string>(
    entry?.preThoughts ?? ""
  );
  const [afterThoughts, setAfterThoughts] = useState<string>(
    entry?.afterThoughts ?? ""
  );
  const [surgeScore, setSurgeScore] = useState<number>(
    entry?.surgeScore ?? 5000
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (entry) {
      setEntryStatus(entry.status === "watched" ? "watched" : "want_to_watch");
      setPreThoughts(entry.preThoughts || "");
      setAfterThoughts(entry.afterThoughts || "");
      if (typeof entry.surgeScore === "number" && entry.surgeScore > 0) {
        setSurgeScore(entry.surgeScore);
      }
    }
  }, [entry?.id, entry?.status, entry?.preThoughts, entry?.afterThoughts, entry?.surgeScore]);

  const surgeCount = useSurgeCount(isEditing ? surgeScore : (entry?.surgeScore ?? 0), 1600);

  const authorProfile = useMemo(() => {
    if (!entry) return { name: "Original", image: "" };
    if (entry.artistStageName) {
      return { name: entry.artistStageName, image: entry.artistProfilePicture || "" };
    }
    if (entry.starName) {
      return { name: entry.starName, image: entry.starImageUrl || "" };
    }
    return { name: entry.originalName, image: entry.originalPosterUrl };
  }, [entry]);

  const alreadyInUserLedger = false;
  const [addedToLedger, setAddedToLedger] = useState(alreadyInUserLedger);

  if (!entry) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            Entry not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const handleStatusChangeInViewer = (newStatus: "watched" | "want_to_watch") => {
    setEntryStatus(newStatus);
    entry.status = newStatus;
    if (newStatus === "watched") {
      if (!entry.watchedAt) {
        entry.watchedAt = new Date().toISOString();
      }
      if (entry.preThoughts) setPreThoughts(entry.preThoughts);
      if (entry.afterThoughts) setAfterThoughts(entry.afterThoughts);
      if (typeof entry.surgeScore === "number" && entry.surgeScore > 0) setSurgeScore(entry.surgeScore);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveInPlace = async () => {
    entry.status = entryStatus;
    entry.preThoughts = preThoughts || "";
    entry.afterThoughts = entryStatus === "watched" ? (afterThoughts || "") : "";
    entry.surgeScore = entryStatus === "watched" ? surgeScore : 0;
    if (entryStatus === "watched" && !entry.watchedAt) {
      entry.watchedAt = new Date().toISOString();
    }

    const apiStatus = entryStatus === "watched" ? "WATCHED" : "WANT_TO_WATCH";
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.id);
    const isValidOriginalUuid = Boolean(
      entry.originalId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.originalId)
    );

    try {
      if (isValidUuid) {
        await apiFetch(`/library/${entry.id}/update`, {
          method: "POST",
          body: JSON.stringify({
            pre_thought: preThoughts.trim() || null,
            post_impression: entryStatus === "watched" ? (afterThoughts.trim() || null) : null,
            status: apiStatus,
            surge_score: entryStatus === "watched" ? surgeScore : null,
          }),
        });
      } else if (isValidOriginalUuid) {
        await apiFetch(`/library/new`, {
          method: "POST",
          body: JSON.stringify({
            original_id: entry.originalId,
            visibility: true,
            status: apiStatus,
            entry_type: "MOVIE",
            pre_thought: preThoughts.trim() || null,
            post_impression: entryStatus === "watched" ? (afterThoughts.trim() || null) : null,
            surge_score: entryStatus === "watched" ? surgeScore : null,
          }),
        });
      }
    } catch (err) {
      console.warn("Failed to persist breakdown to backend library:", err);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/ledger/${entry.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${entry.originalName} — Ledger Entry`,
          text: afterThoughts ?? preThoughts ?? "",
          url: shareUrl,
        });
        return;
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const watchedDate = entry.watchedAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(entry.watchedAt))
    : null;

  const isWatched = entryStatus === "watched";

  const hasPreThoughts = Boolean(preThoughts);
  const hasAfterThoughts = Boolean(afterThoughts);
  const hasSurge = entryStatus === "watched" && Boolean(surgeScore);

  const handleAddToLedger = () => {
    apiFetch(`/library/entry`, {
      method: "POST",
      body: JSON.stringify({
        original_id: entry.originalId,
        status: "want_to_watch",
        pre_thoughts: `Added from ${authorProfile.name}'s breakdown.`,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setAddedToLedger(true);
        } else {
          console.error("[LedgerViewer] Failed to add entry to library, status:", res.status);
        }
      })
      .catch((err) => {
        console.error("[LedgerViewer] Error adding to ledger:", err);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pb-32 md:pb-0">
      {/* ── Floating Nav ─────────────────────────────────────────────────── */}
      <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 hidden sm:block">
            Ledger Entry
          </span>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {copied ? "Copied" : "Share"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Banner (shared by both layouts) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="relative w-full h-[55vw] max-h-[480px] min-h-[220px] overflow-hidden"
      >
        <PosterImage
          src={entry.originalPosterUrl}
          alt={entry.originalName}
          info={entry.genre?.slice(0, 2).join(" • ")}
          className="w-full h-full object-cover object-top"
        />
        {/* Cinematic vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* Genre chips — top right */}
        {entry.genre && (
          <div className="absolute top-16 right-4 md:right-8 flex flex-wrap gap-1 justify-end">
            {entry.genre.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/50"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Original title watermark bottom-left of banner */}
        <div className="absolute bottom-6 left-5 md:left-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">
            {entry.releaseYear ?? ""}
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
            {entry.originalName}
          </h1>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (lg+) — original grid, untouched
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:grid grid-cols-[1fr_280px] gap-0 border-t border-white/[0.07]">

        {/* ── LEFT: Main editorial column ─────────────────────────────── */}
        <div className="border-r border-white/[0.05]">

          {/* Artist byline block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE_OUT }}
            className="flex items-center gap-3 px-10 py-5 border-b border-white/[0.06]"
          >
            <ArtistAvatar
              src={entry.artistProfilePicture || authorProfile.image || entry.originalPosterUrl}
              name={entry.artistStageName || authorProfile.name || entry.originalName}
              size={32}
              className="w-8 h-8 rounded-xl shrink-0"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                {entry.artistStageName || authorProfile.name || entry.originalName}
              </p>
              {watchedDate && (
                <p className="text-[9px] font-medium text-white/30 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  Watched {watchedDate}
                </p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer shadow-md ${
                    isEditing
                      ? "bg-white text-black border-white font-bold"
                      : "bg-amber-500 text-black border-amber-500 hover:bg-amber-400 font-bold shadow-amber-500/20"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditing ? "Done" : "Update Breakdown"}
                </button>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                  isWatched
                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                    : "bg-amber-400/10 border-amber-400/20 text-amber-400"
                }`}
              >
                <Eye className="w-2.5 h-2.5" />
                {isWatched ? "Watched" : "Plan to Watch"}
              </span>
            </div>
          </motion.div>

          {/* ── IN-PLACE EDIT MODE ── */}
          {isEditing ? (
            <InPlaceBreakdownEditor
              entryStatus={entryStatus}
              preThoughts={preThoughts}
              afterThoughts={afterThoughts}
              surgeScore={surgeScore}
              savedSuccess={savedSuccess}
              setPreThoughts={setPreThoughts}
              setAfterThoughts={setAfterThoughts}
              setSurgeScore={setSurgeScore}
              handleStatusChangeInViewer={handleStatusChangeInViewer}
              handleSaveInPlace={handleSaveInPlace}
              setIsEditing={setIsEditing}
            />
          ) : (
            <>
              {/* Prompt banner for Plan to Watch owners */}
              {isOwner && entryStatus === "want_to_watch" && (
                <div className="p-6 m-10 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                      In Watchlist (Plan to Watch)
                    </p>
                    <p className="text-xs text-white/60">
                      Have you watched this film? Mark it as watched to add your post-watching breakdown.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusChangeInViewer("watched")}
                    className="py-3 px-5 rounded-xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.15em] hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Mark as Watched & Add Breakdown
                  </button>
                </div>
              )}

              {/* Pre-thoughts — the "BEFORE" headline */}
              {hasPreThoughts && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
                  className="px-10 pt-8 pb-6 border-b border-white/[0.06]"
                >
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">
                    Before
                  </p>
                  <p className="text-[28px] font-black uppercase tracking-tight leading-[1.15] text-white/90">
                    {preThoughts}
                  </p>
                </motion.div>
              )}

              {/* Post-experience — the "AFTER" body */}
              {hasAfterThoughts && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: EASE_OUT }}
                  className="px-10 pt-8 pb-8 border-b border-white/[0.06]"
                >
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">
                    After
                  </p>
                  <p className="text-[19px] font-medium leading-[1.75] text-white/75">
                    {afterThoughts}
                  </p>
                </motion.div>
              )}

              {/* Surge Score block — bottom anchor */}
              {hasSurge && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="px-10 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-3">
                      Surge Score
                    </p>
                    <div className="flex items-baseline gap-3 flex-wrap">
                    <SurgeScoreDisplay
                      surgeScore={surgeCount}
                      peakSnapshot={entry.peakSnapshot || entry.peakScore || 1000}
                      currentPeakScore={entry.currentPeakScore || undefined}
                      size="lg"
                      label="Resonance at time of watching"
                    />
                    </div>
                  </div>

                  <div className="pb-2">
                    <SurgeBars
                      score={surgeCount}
                      highestScore={entry.peakSnapshot || entry.peakScore || 1000}
                      colorVariant="amber"
                      size="lg"
                    />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE_OUT }}
          className="px-6 py-8 space-y-1"
        >
          {/* Star image spotlight */}
          {entry.starImageUrl && (
            <div className="mb-6">
              <img
                src={entry.starImageUrl}
                alt={entry.starName}
                className="w-full aspect-[4/5] object-cover object-top rounded-2xl border border-white/[0.08]"
              />
              {entry.starName && (
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-3 text-center">
                  {entry.starName}
                </p>
              )}
            </div>
          )}

          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20 mb-3">
              Makers
            </p>
            {entry.makers?.map((m: any) => (
              <CreditRow key={m.name} label={m.role} value={m.name} />
            ))}
          </div>

          {entry.releaseYear && (
            <div className="pt-3">
              <CreditRow label="Released" value={entry.releaseYear} />
            </div>
          )}

          {/* Ledger action */}
          <div className="pt-6">
            <button
              onClick={handleAddToLedger}
              disabled={addedToLedger}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-[0.2em] cursor-pointer ${
                addedToLedger
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-md shadow-amber-500/10 cursor-default"
                  : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
              }`}
            >
              {addedToLedger ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  Added to Plan to Watch
                </>
              ) : (
                <>
                  <BookPlus className="w-3.5 h-3.5 text-amber-400" />
                  Add to Ledger
                </>
              )}
            </button>
          </div>
        </motion.aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (<lg) — newspaper editorial
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden border-t border-white/[0.07] pb-36">
        {/* Status chip row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
          className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            <ArtistAvatar
              src={authorProfile.image}
              name={authorProfile.name}
              size={32}
              className="w-8 h-8 rounded-xl shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                {authorProfile.name}
              </p>
              {watchedDate && (
                <p className="text-[9px] font-medium text-white/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Watched {watchedDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer shadow-sm ${
                  isEditing
                    ? "bg-white text-black border-white font-bold"
                    : "bg-amber-500 text-black border-amber-500 hover:bg-amber-400 font-bold shadow-amber-500/20"
                }`}
              >
                <Edit3 className="w-2.5 h-2.5" />
                {isEditing ? "Done" : "Update Breakdown"}
              </button>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                isWatched
                  ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                  : "bg-amber-400/10 border-amber-400/20 text-amber-400"
              }`}
            >
              <Eye className="w-2.5 h-2.5" />
              {isWatched ? "Watched" : "Plan to Watch"}
            </span>
          </div>
        </motion.div>

        {/* ── MOBILE EDITING MODE ── */}
        {isEditing ? (
          <InPlaceBreakdownEditor
            entryStatus={entryStatus}
            preThoughts={preThoughts}
            afterThoughts={afterThoughts}
            surgeScore={surgeScore}
            savedSuccess={savedSuccess}
            setPreThoughts={setPreThoughts}
            setAfterThoughts={setAfterThoughts}
            setSurgeScore={setSurgeScore}
            handleStatusChangeInViewer={handleStatusChangeInViewer}
            handleSaveInPlace={handleSaveInPlace}
            setIsEditing={setIsEditing}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45, ease: EASE_OUT }}
            className="px-5 pt-6 pb-4"
          >
            {/* Prompt banner for Plan to Watch owners */}
            {isOwner && entryStatus === "want_to_watch" && (
              <div className="p-4 mb-5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                    In Watchlist (Plan to Watch)
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Have you watched this film? Mark it as watched to add your post-watching breakdown.
                  </p>
                </div>
                <button
                  onClick={() => handleStatusChangeInViewer("watched")}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-[0.15em] hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mark as Watched & Add Breakdown
                </button>
              </div>
            )}

            {hasPreThoughts || hasAfterThoughts ? (
              <div className="overflow-hidden relative">
                {/* Pre-thoughts headline with inline float placement */}
                {hasPreThoughts &&
                  (() => {
                    const { line1, rest } = splitHeadline(preThoughts);
                    return (
                      <div className="text-[19px] font-black uppercase tracking-tight leading-[1.3] text-white/90 mb-4">
                        <span>{line1}</span>
                        <span className="float-right block ml-3 mb-2 w-[88px] text-center select-none text-normal font-normal normal-case">
                          <MakerCardContent entry={entry} />
                        </span>
                        {rest && <span>{rest}</span>}
                      </div>
                    );
                  })()}

                {!hasPreThoughts &&
                  hasAfterThoughts &&
                  (() => {
                    const { line1, rest } = splitHeadline(afterThoughts);
                    const firstChar = line1.charAt(0);
                    const line1AfterChar = line1.slice(1);
                    return (
                      <div className="text-[15px] font-medium leading-[1.75] text-white/70">
                        <DropCapSVG letter={firstChar} artistId={entry.artistColorTheme || entry.artistId} />
                        <span>{line1AfterChar}</span>
                        <span className="float-right block ml-3 mb-2 w-[88px] text-center select-none text-normal font-normal normal-case">
                          <MakerCardContent entry={entry} />
                        </span>
                        {rest && <span>{rest}</span>}
                      </div>
                    );
                  })()}

                {hasPreThoughts && hasAfterThoughts && (
                  <p className="text-[15px] font-medium leading-[1.75] text-white/70">
                    <DropCapSVG letter={afterThoughts.charAt(0)} artistId={entry.artistColorTheme || entry.artistId} />
                    {afterThoughts.slice(1)}
                  </p>
                )}
              </div>
            ) : null}

            {!hasPreThoughts && !hasAfterThoughts && hasSurge && (
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">
                Surge Score
              </p>
            )}

            {hasSurge && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6"
              >
                <MobileSurgeScore
                  surgeCount={surgeCount}
                  surgeScore={surgeScore}
                  peakScore={entry.peakScore || 10000}
                />
              </motion.div>
            )}
          </motion.div>
        )}



        {/* ── Stars & Makers identity card sections ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4, ease: EASE_OUT }}
          className="pt-4 pb-8 border-t border-white/[0.05]"
        >
          <IdentityCardsSections entry={entry} />
        </motion.div>

        {/* ── Ledger action ─────────────────────────────────────────── */}
        <div className="px-5 mb-16 md:mb-0">
          <button
            onClick={handleAddToLedger}
            disabled={addedToLedger}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-[0.2em] cursor-pointer ${
              addedToLedger
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-md shadow-amber-500/10 cursor-default"
                : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
            }`}
          >
            {addedToLedger ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-400" />
                Added to Plan to Watch
              </>
            ) : (
              <>
                <BookPlus className="w-3.5 h-3.5 text-amber-400" />
                Add to Ledger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
