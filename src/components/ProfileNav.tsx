import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { motion } from "motion/react";

/**
 * ProfileNav component — A sleek, premium icon component
 * that always handles navigation to the submission rite.
 * 
 * Styled specifically to fit in the top-right of headers.
 */
export function ProfileNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/submit";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate("/submit")}
      className={`relative group flex items-center justify-center transition-all ${className}`}
      aria-label="Submit Release"
    >
      <div className={`
        relative p-2 rounded-xl border transition-all duration-300
        ${isActive 
          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
          : "bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white"
        }
      `}>
        <User className="w-5 h-5 transition-transform group-hover:scale-110" />
        
        {/* Subtle active pulse or indicator if needed, though background change is strong */}
        {isActive && (
          <motion.div 
            layoutId="profile-active-glow"
            className="absolute -inset-[2px] rounded-[13px] border border-white/20 -z-10"
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          />
        )}
      </div>
    </motion.button>
  );
}
