import React from "react";
import { motion } from "framer-motion";
import { Heart, Share2 } from "lucide-react";

interface WorkActionBarProps {
  isLiked: boolean;
  setIsLiked: (val: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  workId: string | number;
  variant?: "poster" | "edit" | "script";
  className?: string;
}

export const WorkActionBar: React.FC<WorkActionBarProps> = ({
  isLiked,
  setIsLiked,
  setToastMessage,
  workId,
  variant = "poster",
  className = "",
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) {
      setToastMessage("ADDED TO VAULT");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

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
    setToastMessage("Ready to share");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Size and styling configurations based on variant
  const config = {
    poster: {
      buttonClass: "w-12 h-12 rounded-full border backdrop-blur-xl transition-all duration-300 shadow-2xl flex items-center justify-center",
      likeActive: "bg-white text-black border-white",
      likeInactive: "bg-white/10 text-white/50 border-white/20 hover:text-white hover:bg-white/15",
      shareClass: "bg-white/10 text-white/50 border-white/20 hover:text-white hover:bg-white/15",
      iconSize: 20,
    },
    edit: {
      buttonClass: "w-10 h-10 rounded-full border backdrop-blur-md transition-all duration-300 shadow-xl flex items-center justify-center",
      likeActive: "bg-white text-black border-white",
      likeInactive: "bg-black/40 text-white/50 border-white/10 hover:bg-white/10 hover:text-white",
      shareClass: "bg-black/40 text-white/50 border-white/10 hover:bg-white/10 hover:text-white",
      iconSize: 16,
    },
    script: {
      buttonClass: "w-9 h-9 rounded-full border backdrop-blur-md transition-all duration-300 flex items-center justify-center",
      likeActive: "bg-white text-black border-white",
      likeInactive: "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white",
      shareClass: "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white",
      iconSize: 14,
    },
  }[variant];

  return (
    <div className={`flex items-center ${className || "gap-2"}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        className={`${config.buttonClass} ${isLiked ? config.likeActive : config.likeInactive}`}
        title={isLiked ? `Unlike ${variant}` : `Like ${variant}`}
      >
        <Heart size={config.iconSize} strokeWidth={2.5} className={isLiked ? "fill-current" : ""} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={`${config.buttonClass} ${config.shareClass}`}
        title={`Share ${variant}`}
      >
        <Share2 size={config.iconSize} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};
