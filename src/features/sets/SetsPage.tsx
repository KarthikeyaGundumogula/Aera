import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../../components/Logo';
import { ProfileNav } from '../../components/ProfileNav';
import { MobileTopHeader } from '../navigation/MobileTopHeader';
import { GlobalSearch } from '../../components/search/GlobalSearch';
import { DesktopHeader } from '../navigation/DesktopHeader';
import { FestivalStage } from './components/FestivalStage';
import { SetsGrid } from './components/SetsGrid';
import { CreateSetModal } from './components/CreateSetModal';

/**
 * SetsPage — The /sets route.
 *
 * Page Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Sticky Header: Logo + Back + "Sets" wordmark               │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Zone A — Festival Stage                                     │
 * │   FestivalStage: app-native horizontal snap scroll         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Zone B — Set Registry                                       │
 * │   SetsGrid: minimal 1/2-col app feed                        │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Design: Dark Luxury / Editorial. Consistent with OriginalPage conventions.
 */
export function SetsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);

  const getNavClassName = (active: boolean) =>
    `text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${active ? "text-white" : "text-white/60 hover:text-white"}`;

  return (
    <div className="min-h-screen bg-surface-deep overflow-y-auto no-scrollbar pt-16 md:pt-24">
      {/* Mobile Header */}
      <MobileTopHeader />

      {/* Sticky Theatre-Style Header (Desktop) */}
      <DesktopHeader />

      {/* Page body — padded below fixed header */}
      <div className="">
        {/* Zone A — Festival Stage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className=""
        >
          <FestivalStage />
        </motion.div>

        {/* Zone B — Set Registry */}
        <SetsGrid onCreateSetClick={() => setIsCreateSetOpen(true)} />
      </div>

      <CreateSetModal
        isOpen={isCreateSetOpen}
        onClose={() => setIsCreateSetOpen(false)}
        onCreate={() => undefined}
      />
    </div>
  );
}
