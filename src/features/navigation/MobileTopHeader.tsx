import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Logo } from "../../components/Logo";
import { GlobalSearch } from "../../components/search/GlobalSearch";
import { ProfileNav } from "../../components/ProfileNav";

interface MobileTopHeaderProps {
  showSearch?: boolean;
  showProfile?: boolean;
  rightActions?: React.ReactNode;
  isVisible?: boolean;
}

export function MobileTopHeader({
  showSearch = true,
  showProfile = true,
  rightActions,
  isVisible = true,
}: MobileTopHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
    >
      <Logo onClick={() => navigate("/")} showText={isHome} />
      
      <div className="flex items-center gap-4">
        {rightActions ? (
          rightActions
        ) : (
          <>
            {showSearch && <GlobalSearch />}
            {showProfile && <ProfileNav />}
          </>
        )}
      </div>
    </motion.header>
  );
}
