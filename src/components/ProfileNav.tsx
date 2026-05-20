import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Plus, Film, ChevronDown, UserCircle, MessageSquare, Bookmark, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

/**
 * ProfileNav component — A sleek, premium dropdown menu
 * that handles artist-focused navigation.
 */
export function ProfileNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Studio",
      icon: <Film className="w-4 h-4" />,
      path: "/studio",
      description: "Manage your stage"
    },
    {
      label: "Ledger",
      icon: <Bookmark className="w-4 h-4" />,
      path: "/ledger",
      description: "Your cinematic ledger"
    },
    {
      label: "Contact Founder",
      icon: <MessageSquare className="w-4 h-4" />,
      path: "/contact",
      description: "Slap your thoughts"
    },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2 transition-all"
        aria-label="Command Center"
      >
        <div className={`
          relative p-2 rounded-xl border transition-all duration-300 flex items-center gap-2
          ${isOpen || menuItems.some(item => isActive(item.path))
            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            : "bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white"
          }
        `}>
          <User className="w-5 h-5 transition-transform group-hover:scale-110" />
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />

          {(isOpen || menuItems.some(item => isActive(item.path))) && (
            <motion.div
              layoutId="profile-active-glow"
              className="absolute -inset-[2px] rounded-[13px] border border-white/20 -z-10"
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            />
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="px-3 py-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Command Center</span>
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`
                    w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group/item
                    ${isActive(item.path) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive(item.path) ? "bg-white text-black" : "bg-white/5 group-hover/item:bg-white/10"}
                  `}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest truncate">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 px-2 pb-2 space-y-1">
              <button 
                onClick={() => handleNav("/")}
                className="w-full text-center py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 hover:text-white/60 transition-colors"
              >
                Return to Theatre
              </button>
              <button 
                onClick={() => {
                  logout();
                  handleNav("/");
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
