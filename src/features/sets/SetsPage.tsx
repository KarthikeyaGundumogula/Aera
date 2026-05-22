import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../../components/Logo';
import { ProfileNav } from '../../components/ProfileNav';
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
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar pt-20 md:pt-24">
      {/* Sticky Theatre-Style Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#050505]/95 border-b border-white/5"
      >
        <div className="flex items-center gap-8">
          <Logo onClick={() => navigate("/")} showText={false} />
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => navigate("/")}
              className={getNavClassName(location.pathname === "/")}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/theatre")}
              className={getNavClassName(location.pathname === "/theatre")}
            >
              Theatre
            </button>
            <button
              onClick={() => navigate("/originals")}
              className={getNavClassName(location.pathname.startsWith("/originals"))}
            >
              Originals
            </button>
            <button
              onClick={() => navigate("/sets")}
              className={getNavClassName(location.pathname === "/sets")}
            >
              Sets
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <ProfileNav />
        </div>
      </motion.header>

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
