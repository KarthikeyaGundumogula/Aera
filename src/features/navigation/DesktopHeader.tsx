import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { GlobalSearch } from "../../components/search/GlobalSearch";
import { ProfileNav } from "../../components/ProfileNav";

interface DesktopHeaderProps {
  isVisible?: boolean;
  isScrolled?: boolean;
}

export function DesktopHeader({ isVisible = true, isScrolled: propIsScrolled }: DesktopHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [localIsScrolled, setLocalIsScrolled] = useState(false);

  useEffect(() => {
    const handleNativeScroll = () => {
      setLocalIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleNativeScroll);
    return () => window.removeEventListener("scroll", handleNativeScroll);
  }, []);

  const isScrolled = propIsScrolled !== undefined ? propIsScrolled : localIsScrolled;

  const navItems = [
    { label: "Center", path: "/center" },
    { label: "Lounge", path: "/" },
    { label: "Theatre", path: "/theatre" },
    { label: "Originals", path: "/originals" },
    { label: "Sets", path: "/sets" },
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
    >
      <div className="flex items-center gap-8">
        <Logo onClick={() => navigate("/")} showText={false} />
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`transition-all duration-200 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-xl relative ${
                  isActive
                    ? "text-black"
                    : "text-white/45 hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavBox"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <GlobalSearch />
        <ProfileNav />
      </div>
    </motion.header>
  );
}
