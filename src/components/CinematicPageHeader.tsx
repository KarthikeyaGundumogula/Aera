import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { AdaptiveTitle } from './AdaptiveTitle';

interface CinematicPageHeaderProps {
  /** The title displayed in the absolute center of the header. */
  title: string;
  /** Called when the back arrow is clicked. */
  onBack: () => void;
  /** Optional label shown next to the back arrow (hidden on mobile). */
  backLabel?: string;
  /**
   * Optional right-side action slot — rendered to the left of ProfileNav.
   * Use this for page-specific controls (e.g. OriginalCommandCenter, Releases link).
   */
  rightActions?: ReactNode;
  /** Extra Tailwind classes on the outer <header> element. */
  className?: string;
  /** Called when the title is clicked (e.g., for scroll-to-top). */
  onTitleClick?: () => void;
}

/**
 * CinematicPageHeader — A shared sticky header used across detail pages.
 *
 * Layout (mirrors OriginalPage):
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ← Back   [optional label]  │  [Title centered abs]  │  [rightActions]  │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Used by: OriginalPage, SetDetailPage (and future detail pages).
 */
export function CinematicPageHeader({
  title,
  onBack,
  backLabel,
  rightActions,
  className = '',
  onTitleClick,
}: CinematicPageHeaderProps) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5 ${className}`}
    >
      {/* Left: Back button */}
      <div className="flex-1 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="group p-2 -ml-2 rounded-full hover:bg-white/5 transition-all active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors group-hover:-translate-x-0.5" />
        </button>
        {backLabel && (
          <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
            {backLabel}
          </span>
        )}
      </div>

      {/* Right: Page-specific actions */}
      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 z-10">
        {rightActions}
      </div>

      {/* Center: Title — absolutely positioned for pixel-perfect centering */}
      <div className="absolute inset-x-0 flex justify-center pointer-events-none z-20">
        {onTitleClick ? (
          <button
            onClick={onTitleClick}
            className="group transition-all active:scale-95 pointer-events-auto"
          >
            <AdaptiveTitle
              title={title}
              as="h1"
              multiWordClass="text-[10px] md:text-[12px] leading-tight"
              singleWordClamp="clamp(8px, 3vw, 13px)"
              className="text-white/90 group-hover:text-white transition-colors tracking-[0.5em] text-center"
            />
          </button>
        ) : (
          <AdaptiveTitle
            title={title}
            as="h1"
            multiWordClass="text-[10px] md:text-[12px] leading-tight"
            singleWordClamp="clamp(8px, 3vw, 13px)"
            className="text-white/90 tracking-[0.5em] text-center"
          />
        )}
      </div>
    </motion.header>
  );
}
