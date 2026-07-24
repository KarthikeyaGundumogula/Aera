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
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Share2, Check, BookPlus, Eye, Clock } from "lucide-react";
import { mockLedger, LedgerItem, LedgerMakerCredit } from "../../mock/ledger";
import { ARTISTS_MOCK, STARS_MOCK, MAKERS_MOCK } from "../../mock";
import { SurgeBars } from "../../components/SurgeBars";

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

  const artist = ARTISTS_MOCK.find((a) => a.id === artistId) as { themeClasses?: string } | undefined;
  if (artist?.themeClasses?.includes("text-blue")) return ["#334155", "#64748b"];
  if (artist?.themeClasses?.includes("text-amber")) return ["#78350f", "#f59e0b"];
  if (artist?.themeClasses?.includes("text-red")) return ["#7f1d1d", "#ef4444"];

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
}

function MobileSurgeScore({ surgeCount, surgeScore }: MobileSurgeProps) {
  const pct = Math.min(Math.round((surgeCount / 10000) * 100), 100);

  return (
    <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
      <div className="flex items-baseline gap-3">
        <span
          className="text-[40px] font-black leading-none tracking-tighter tabular-nums"
          style={{
            background:
              "linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #FBBF24 70%, #B45309 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 16px rgba(217,119,6,0.4))",
          }}
        >
          {pct}%
        </span>
        <span className="text-[10px] font-mono font-bold text-white/35">
          {surgeCount.toLocaleString()} / 10,000
        </span>
      </div>

      <div className="flex items-center h-[40px]">
        <SurgeBars
          score={surgeCount}
          highestScore={10000}
          colorVariant="amber"
          size="xl"
        />
      </div>
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

  // Add makers from entry.makers
  entry.makers?.forEach((m) => {
    if (!makersList.some((x) => x.name === m.name)) {
      makersList.push({ name: m.name, role: m.role, imageUrl: m.imageUrl });
    }
  });

  // Supplement with MAKERS_MOCK for this original
  if (entry.originalId) {
    const mockMakers = MAKERS_MOCK.filter((m) => m.originalId === entry.originalId);
    mockMakers.forEach((m) => {
      if (!makersList.some((x) => x.name === m.actorName)) {
        makersList.push({
          name: m.actorName,
          role: m.characterName || "Maker",
          imageUrl: m.imageUrl,
        });
      }
    });
  }

  // Build Stars List
  const starsList: PersonCard[] = [];

  if (entry.starName) {
    starsList.push({
      name: entry.starName,
      role: "Lead Star",
      imageUrl: entry.starImageUrl,
    });
  }

  // Supplement with STARS_MOCK for this original
  if (entry.originalId) {
    const mockStars = STARS_MOCK.filter((s) => s.originalId === entry.originalId);
    mockStars.forEach((s) => {
      if (!starsList.some((x) => x.name === s.actorName)) {
        starsList.push({
          name: s.actorName,
          role: s.characterName || "Star",
          imageUrl: s.imageUrl,
        });
      }
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function LedgerViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const entry: LedgerItem | undefined = mockLedger.find((l) => l.id === id);
  const surgeCount = useSurgeCount(entry?.surgeScore ?? 0, 1600);

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/ledger/${entry.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${entry.originalName} — Ledger Entry`,
          text: entry.afterThoughts ?? entry.preThoughts ?? "",
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

  const isWatched = entry.status === "watched";

  const hasPreThoughts = Boolean(entry.preThoughts);
  const hasAfterThoughts = Boolean(entry.afterThoughts);
  const hasSurge = Boolean(entry.surgeScore);

  const authorProfile = useMemo(() => {
    if (entry.artistId) {
      const found = ARTISTS_MOCK.find((a) => a.id === entry.artistId);
      if (found) return { name: found.name, image: found.image };
    }
    if (entry.starName) {
      return { name: entry.starName, image: entry.starImageUrl };
    }
    return { name: entry.originalName, image: entry.originalPosterUrl };
  }, [entry]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all"
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
        <img
          src={entry.originalPosterUrl}
          alt={entry.originalName}
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
            <img
              src={entry.starImageUrl ?? entry.originalPosterUrl}
              alt={entry.starName ?? entry.originalName}
              className="w-8 h-8 rounded-xl object-cover object-top border border-white/10"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                {entry.starName ?? entry.originalName}
              </p>
              {watchedDate && (
                <p className="text-[9px] font-medium text-white/30 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  Watched {watchedDate}
                </p>
              )}
            </div>
            <div className="ml-auto">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                  isWatched
                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                    : "bg-amber-400/10 border-amber-400/20 text-amber-400"
                }`}
              >
                <Eye className="w-2.5 h-2.5" />
                {isWatched ? "Seen" : "Hype"}
              </span>
            </div>
          </motion.div>

          {/* Pre-thoughts — the "BEFORE" headline */}
          {entry.preThoughts && (
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
                {entry.preThoughts}
              </p>
            </motion.div>
          )}

          {/* Post-experience — the "AFTER" body */}
          {entry.afterThoughts && (
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
                {entry.afterThoughts}
              </p>
            </motion.div>
          )}

          {/* Surge Score block — bottom anchor */}
          {entry.surgeScore && (
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
                  <span
                    className="text-[72px] font-black leading-none tracking-tighter"
                    style={{
                      background:
                        "linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #FBBF24 70%, #B45309 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 24px rgba(217,119,6,0.4))",
                    }}
                  >
                    {Math.min(Math.round((surgeCount / 10000) * 100), 100)}%
                  </span>
                  <span className="text-[18px] font-bold text-white/40 tracking-tight font-mono">
                    {surgeCount.toLocaleString()} / 10,000
                  </span>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mt-2">
                  Resonance at time of watching
                </p>
              </div>

              <div className="pb-2">
                <SurgeBars
                  score={surgeCount}
                  highestScore={10000}
                  colorVariant="amber"
                  size="lg"
                />
              </div>
            </motion.div>
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
            {entry.makers?.map((m) => (
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
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
              <BookPlus className="w-3.5 h-3.5" />
              Add to Ledger
            </button>
          </div>
        </motion.aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (<lg) — newspaper editorial
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden border-t border-white/[0.07]">
        {/* Status chip row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
          className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            {authorProfile.image ? (
              <img
                src={authorProfile.image}
                alt={authorProfile.name}
                className="w-8 h-8 rounded-xl object-cover object-top border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/40 text-xs font-black">
                {authorProfile.name.charAt(0)}
              </div>
            )}
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
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
              isWatched
                ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                : "bg-amber-400/10 border-amber-400/20 text-amber-400"
            }`}
          >
            <Eye className="w-2.5 h-2.5" />
            {isWatched ? "Seen" : "Hype"}
          </span>
        </motion.div>

        {/*
         * ── Editorial body ────────────────────────────────────────────
         *
         * Line 1 is rendered BEFORE the float in the DOM, forcing Line 1 to
         * span 100% full-width edge-to-edge across the container.
         * The float-right MakerCard is placed AFTER Line 1 in the DOM, so
         * Line 2+ and afterThoughts wrap to the left of the MakerCard.
         */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45, ease: EASE_OUT }}
          className="px-5 pt-6 pb-4"
        >
          {hasPreThoughts || hasAfterThoughts ? (
            <div className="overflow-hidden relative">
              {/* Pre-thoughts headline with inline float placement */}
              {hasPreThoughts &&
                (() => {
                  const { line1, rest } = splitHeadline(entry.preThoughts!);
                  return (
                    <p className="text-[19px] font-black uppercase tracking-tight leading-[1.3] text-white/90 mb-4">
                      {/* Line 1 is rendered BEFORE the float in DOM -> 100% FULL WIDTH */}
                      <span>{line1}</span>

                      {/* Float-right Maker Card inserted AFTER Line 1 in DOM */}
                      <span className="float-right block ml-3 mb-2 w-[88px] text-center select-none text-normal font-normal normal-case">
                        <MakerCardContent entry={entry} />
                      </span>

                      {/* Remaining pre-thoughts wrap to the left of MakerCard */}
                      {rest && <span>{rest}</span>}
                    </p>
                  );
                })()}

              {/* If NO pre-thoughts, MakerCard floats after line 1 of afterThoughts */}
              {!hasPreThoughts &&
                hasAfterThoughts &&
                (() => {
                  const { line1, rest } = splitHeadline(entry.afterThoughts!);
                  const firstChar = line1.charAt(0);
                  const line1AfterChar = line1.slice(1);
                  return (
                    <p className="text-[15px] font-medium leading-[1.75] text-white/70">
                      <DropCapSVG letter={firstChar} artistId={entry.artistId} />
                      <span>{line1AfterChar}</span>

                      {/* Float-right Maker Card inserted AFTER Line 1 in DOM */}
                      <span className="float-right block ml-3 mb-2 w-[88px] text-center select-none text-normal font-normal normal-case">
                        <MakerCardContent entry={entry} />
                      </span>

                      {rest && <span>{rest}</span>}
                    </p>
                  );
                })()}

              {/* After-thoughts body when pre-thoughts ARE present */}
              {hasPreThoughts && hasAfterThoughts && (
                <p className="text-[15px] font-medium leading-[1.75] text-white/70">
                  <DropCapSVG letter={entry.afterThoughts!.charAt(0)} artistId={entry.artistId} />
                  {entry.afterThoughts!.slice(1)}
                </p>
              )}
            </div>
          ) : null}

          {/*
           * Scenario C: No text at all → show a restrained score label
           * so the surge block below has context.
           */}
          {!hasPreThoughts && !hasAfterThoughts && hasSurge && (
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">
              Surge Score
            </p>
          )}

          {/* Compact Surge Score — in-flow, not a hero block */}
          {hasSurge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6"
            >
              <MobileSurgeScore
                surgeCount={surgeCount}
                surgeScore={entry.surgeScore!}
              />
            </motion.div>
          )}
        </motion.div>

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
        <div className="px-5 pb-10">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70 transition-all text-[9px] font-black uppercase tracking-[0.2em]">
            <BookPlus className="w-3.5 h-3.5" />
            Add to Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
