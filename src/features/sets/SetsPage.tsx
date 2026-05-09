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
      {/* Page body — no sticky header as per global bottom-nav pattern */}
      <div className="">
        {/* Zone A — Festival Stage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className=""
        >
          <FestivalCarousel />
        </motion.div>

        {/* Zone B — Set Registry */}
        <SetsGrid />
      </div>
    </div>
  );
}
