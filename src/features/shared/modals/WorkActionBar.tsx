import React from "react";
import { motion } from "motion/react";
import { Share2 } from "lucide-react";

interface WorkActionBarProps {
  workId: string | number;
  variant?: "poster" | "edit" | "script";
  className?: string;
}

/**
 * WorkActionBar — Share button only.
 * The Honour action has been moved to the dedicated Bottom HUD Bar.
 */
export const WorkActionBar: React.FC<WorkActionBarProps> = ({
  workId,
  variant = "poster",
  className = "",
}) => {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/works/${workId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        const el = document.createElement("textarea");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const iconSize = variant === "poster" ? 20 : variant === "edit" ? 18 : 16;

  return (
    <div className={`flex items-center ${className || "gap-3"}`}>
      {/* Share — bare icon, no circle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.88 }}
        onClick={handleShare}
        title={`Share ${variant}`}
        aria-label={`Share ${variant}`}
        className="flex items-center justify-center text-white/30 hover:text-white/70 transition-colors duration-150 cursor-pointer rounded-md px-1.5 py-1"
      >
        <Share2 size={iconSize - 2} strokeWidth={1.8} />
      </motion.button>
    </div>
  );
};
