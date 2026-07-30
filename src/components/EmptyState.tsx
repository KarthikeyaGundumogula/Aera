import React, { ElementType, ReactNode } from "react";
import { motion } from "motion/react";
import { Film, BookOpen, Radio, Layers, Compass, Sparkles, Plus, ArrowRight, LucideIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

export interface EmptyStateProps {
  /** Optional section header title to display above the empty container */
  sectionTitle?: string;
  /** Section header icon */
  sectionIcon?: ElementType;
  /** Primary icon for the empty state box */
  icon?: ElementType | ReactNode;
  /** Main heading title */
  title: string;
  /** Descriptive body text */
  description: string;
  /** Pill badge label e.g. "EMPTY ARCHIVE" */
  badge?: string;
  /** Primary action button text */
  actionLabel?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryActionLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Visual density variant */
  variant?: "default" | "compact" | "card" | "minimal";
  /** Optional container class overrides */
  className?: string;
}

export const EMPTY_PRESETS = {
  theatre: {
    sectionTitle: "THEATRE RELEASES",
    icon: Film,
    title: "No Theatre Works Released",
    description: "This stage has not published any cinematic edits, posters, or screenplays yet.",
    badge: "THEATRE EMPTY",
  },
  wall: {
    sectionTitle: "STAGE DISPATCHES",
    icon: Radio,
    title: "Stage Timeline Silent",
    description: "No broadcasts, announcements, or pinned thoughts have been posted to this timeline.",
    badge: "NO DISPATCHES",
  },
  library: {
    sectionTitle: "ORIGINALS LIBRARY",
    icon: BookOpen,
    title: "Library Unlinked",
    description: "No original motion pictures or dossiers are linked to this archive yet.",
    badge: "ARCHIVE EMPTY",
  },
  sets: {
    sectionTitle: "CURATED SETS",
    icon: Layers,
    title: "No Sets Discovered",
    description: "No curated film sets or community festival showcases match your current filter.",
    badge: "ZERO SETS",
  },
  originals: {
    sectionTitle: "FEATURED ORIGINALS",
    icon: Film,
    title: "No Originals Found",
    description: "There are no original motion picture titles matching your criteria.",
    badge: "NO TITLES",
  },
  search: {
    sectionTitle: "SEARCH RESULTS",
    icon: Compass,
    title: "Zero Matching Signals",
    description: "We couldn't find any artists, originals, or sets matching your search query.",
    badge: "NO RESULTS",
  },
  ledger: {
    sectionTitle: "CINEMATIC LEDGER",
    icon: Sparkles,
    title: "Ledger Unwritten",
    description: "Your personal film ledger is empty. Log recommendations and presence entries to build your legacy.",
    badge: "LEDGER EMPTY",
  },
  studioWorks: {
    sectionTitle: "STUDIO RELEASES",
    icon: Film,
    title: "Empty Media Pool",
    description: "Release your first cinematic work to establish your timeline and showcase your craft.",
    badge: "STUDIO READY",
  },
} as const;

export function EmptyState({
  sectionTitle,
  sectionIcon,
  icon: IconInput,
  title,
  description,
  badge,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  const IconComponent = typeof IconInput === "function" ? (IconInput as ElementType) : null;

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* Optional Section Header */}
      {sectionTitle && (
        <SectionHeader
          title={sectionTitle}
          icon={sectionIcon}
          containerClassName="mb-1"
        />
      )}

      {/* Main Empty Container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`relative w-full rounded-3xl border border-dashed border-white/10 bg-white/[0.015] backdrop-blur-sm flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 group hover:border-white/20 hover:bg-white/[0.025] ${
          variant === "compact"
            ? "py-10 px-6 gap-3"
            : variant === "minimal"
            ? "py-8 px-4 gap-2 border-none bg-transparent"
            : variant === "card"
            ? "py-12 px-8 gap-4 border-solid bg-[#0b0c10]/80"
            : "py-20 px-8 gap-5"
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />

        {/* Top Badge Tag */}
        {badge && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/50">
              {badge}
            </span>
          </div>
        )}

        {/* Central Icon Container */}
        {(IconComponent || React.isValidElement(IconInput)) && (
          <div className="relative flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 group-hover:text-white/80 group-hover:scale-105 group-hover:border-white/20 transition-all duration-300 shadow-xl">
            {IconComponent ? (
              <IconComponent className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5]" />
            ) : (
              (IconInput as ReactNode)
            )}
          </div>
        )}

        {/* Title & Description */}
        <div className="max-w-md space-y-2 z-10">
          <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-xs text-white/40 font-normal leading-relaxed tracking-wide max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 z-10">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.25em] shadow-lg transition-all active:scale-95 hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                {actionLabel}
              </button>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-black text-[9px] uppercase tracking-[0.25em] transition-all active:scale-95"
              >
                {secondaryActionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
