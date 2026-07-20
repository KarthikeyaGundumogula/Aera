/**
 * LedgerViewer.tsx
 *
 * Full-screen editorial view for a single Ledger entry.
 * Layout inspired by a premium broadsheet / cinematic magazine spread.
 *
 * URL: /ledger/:id
 * Shareable: yes — the URL itself is the share target.
 *
 * Desktop layout (grid):
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
 */

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Share2,
  Check,
  BookPlus,
  Eye,
  Clock,
} from "lucide-react";
import { mockLedger, LedgerItem } from "../../mock/ledger";
import { SurgeBars } from "../../components/SurgeBars";

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

// ─── Sidebar credit row ───────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function LedgerViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
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

      {/* ── Body Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0 border-t border-white/[0.07]">

        {/* ── LEFT: Main editorial column ─────────────────────────────── */}
        <div className="border-r border-white/[0.05]">

          {/* Artist byline block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center gap-3 px-6 md:px-10 py-5 border-b border-white/[0.06]"
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
              transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="px-6 md:px-10 pt-8 pb-6 border-b border-white/[0.06]"
            >
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">
                Before
              </p>
              <p className="text-[22px] md:text-[28px] font-black uppercase tracking-tight leading-[1.15] text-white/90">
                {entry.preThoughts}
              </p>
            </motion.div>
          )}

          {/* Post-experience — the "AFTER" body */}
          {entry.afterThoughts && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="px-6 md:px-10 pt-8 pb-8 border-b border-white/[0.06]"
            >
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">
                After
              </p>
              <p className="text-[17px] md:text-[19px] font-medium leading-[1.7] text-white/75">
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
              className="px-6 md:px-10 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
            >
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/25 mb-3">
                  Surge Score
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="text-[56px] md:text-[72px] font-black leading-none tracking-tighter"
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
                  <span className="text-[14px] md:text-[18px] font-bold text-white/40 tracking-tight font-mono">
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
          transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
    </div>
  );
}
