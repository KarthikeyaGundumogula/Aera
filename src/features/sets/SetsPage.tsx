import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../../components/Logo';
import { FestivalCarousel } from './components/FestivalCarousel';
import { SetsGrid } from './components/SetsGrid';

/**
 * SetsPage — The /sets route.
 *
 * Page Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Sticky Header: Logo + Back + "Sets" wordmark               │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Zone A — Festival Stage                                     │
 * │   FestivalCarousel: hero 16:9 slides for LIVE/VOTING events │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Zone B — Set Registry                                       │
 * │   SetsGrid: featured full-width + 2-col editorial grid      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Design: Dark Luxury / Editorial. Consistent with OriginalPage conventions.
 */
export function SetsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Sticky Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5"
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="group p-2 -ml-2 rounded-full hover:bg-white/5 transition-all active:scale-90"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors group-hover:-translate-x-0.5" />
          </button>
          <Logo onClick={() => navigate('/')} showText={false} />
        </div>

        {/* Center wordmark — absolutely positioned for optical balance */}
        <div className="absolute inset-x-0 flex justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">
            Sets
          </span>
        </div>

        {/* Right — placeholder for future filter/search */}
        <div className="w-10" aria-hidden="true" />
      </motion.header>

      {/* Page body — padded below fixed header */}
      <div className="pt-[68px] md:pt-[72px]">
        {/* Zone A — Festival Stage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className=""
        >
          <FestivalCarousel />
        </motion.div>

        {/* Divider */}
        <div className="mx-5 sm:mx-8 mb-10 h-px bg-white/5" />

        {/* Zone B — Set Registry */}
        <SetsGrid />
      </div>
    </div>
  );
}
