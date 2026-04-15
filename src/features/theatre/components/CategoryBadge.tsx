import { motion } from "motion/react";
import { memo } from "react";
import { EditsIcon, PostersIcon, ScriptsIcon } from "../../../components/icons/AppIcons";
import { Tooltip } from "../../../components/Tooltip";
import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isScriptWork,
} from "../../shared/work";

// ─── Scanning-light animation shared by all badges ──────────────────────────

function ScanLine({ range = 60 }: { range?: number }) {
  return (
    <motion.div
      animate={{ x: [-range, range] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
    />
  );
}

// ─── Variants ───────────────────────────────────────────────────────────────

interface BadgeProps {
  /** "desktop" = theatre canvas. "mobile" = theatre mobile chip. "feed" = feed-specific badges. */
  variant: "desktop" | "mobile" | "feed";
}

// ─── Video Badge ────────────────────────────────────────────────────────────

function VideoBadgeDesktop() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <Tooltip content="Motion Edit" position="bottom">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group/play pointer-events-auto"
        >
          <div className="absolute inset-0 rounded-full bg-white/10 blur-md scale-150 group-hover/play:bg-white/30 transition-colors duration-700" />
          <div className="relative w-12 h-12 rounded-full bg-black/30 backdrop-blur-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            <EditsIcon className="h-[18px] w-[18px] text-white fill-white/10 ml-1 group-hover/play:scale-110 transition-transform duration-500" />
            <ScanLine />
          </div>
        </motion.div>
      </Tooltip>
    </div>
  );
}

function VideoBadgeMobile() {
  return (
    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
      <EditsIcon className="h-3 w-3 text-white fill-white/10 ml-0.5" />
    </div>
  );
}

function VideoBadgeFeed() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group/play pointer-events-auto"
      >
        <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-150 group-hover/play:bg-white/30 transition-colors duration-700" />
        <div className="relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
          <EditsIcon className="h-5 w-5 text-white fill-white/10 ml-1 group-hover/play:scale-110 transition-transform duration-500" />
          <ScanLine />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Poster Badge ───────────────────────────────────────────────────────────

function PosterBadgeDesktop() {
  return (
    <div className="absolute top-3 right-3 z-10">
      <Tooltip content="Design Edit" position="bottom">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group/sparkle pointer-events-auto"
        >
          <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/sparkle:bg-white/30 transition-colors duration-500" />
          <div className="relative w-7 h-7 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden">
            <PostersIcon className="h-3 w-3 text-white fill-white/10 group-hover/sparkle:rotate-12 transition-transform" />
            <ScanLine range={40} />
          </div>
        </motion.div>
      </Tooltip>
    </div>
  );
}

function PosterBadgeMobile() {
  return (
    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
      <PostersIcon className="h-2 w-2 text-white fill-white/10" />
    </div>
  );
}

function PosterBadgeFeed() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group/sparkle pointer-events-auto"
      >
        <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/sparkle:bg-white/30 transition-colors duration-500" />
        <div className="relative w-8 h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
          <PostersIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/sparkle:rotate-12 transition-transform" />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Script Badge ───────────────────────────────────────────────────────────

function ScriptBadgeDesktop() {
  return (
    <div className="absolute bottom-3 right-3 z-10">
      <Tooltip content="Script Edit" position="top">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group/pen pointer-events-auto"
        >
          <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/pen:bg-white/30 transition-colors duration-500" />
          <div className="relative w-7 h-7 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
            <ScriptsIcon className="h-3 w-3 text-white fill-white/10 group-hover/pen:scale-110 transition-transform duration-500" />
            <ScanLine range={40} />
          </div>
        </motion.div>
      </Tooltip>
    </div>
  );
}

function ScriptBadgeMobile() {
  return (
    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm">
      <ScriptsIcon className="h-2 w-2 text-white fill-white/10" />
    </div>
  );
}

function ScriptBadgeFeed() {
  return (
    <div className="absolute top-4 right-4 z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group/pen pointer-events-auto"
      >
        <div className="absolute inset-0 rounded-full bg-black/10 blur-sm scale-125 transition-colors duration-500" />
        <div className="relative w-8 h-8 rounded-full bg-black/80 backdrop-blur-xl border border-black flex items-center justify-center overflow-hidden shadow-xl">
          <ScriptsIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/pen:scale-110 transition-transform duration-500" />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Renders the correct category badge (Video / Poster / Script) based on the
 * item's category and the requested size variant.
 *
 * Returns `null` if no badge applies — safe to render unconditionally.
 */
export const CategoryBadge = memo(function CategoryBadge({
  item,
  variant,
}: BadgeProps & { item: TheatreItem }) {
  if (isEditWork(item)) {
    if (variant === "desktop") return <VideoBadgeDesktop />;
    if (variant === "feed") return <VideoBadgeFeed />;
    return <VideoBadgeMobile />;
  }
  if (isPosterWork(item)) {
    if (variant === "desktop") return <PosterBadgeDesktop />;
    if (variant === "feed") return <PosterBadgeFeed />;
    return <PosterBadgeMobile />;
  }
  if (isScriptWork(item)) {
    if (variant === "desktop") return <ScriptBadgeDesktop />;
    if (variant === "feed") return <ScriptBadgeFeed />;
    return <ScriptBadgeMobile />;
  }
  return null;
});
