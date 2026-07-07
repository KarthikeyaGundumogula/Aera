import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  isFavorited: boolean;
  onFavorite?: () => void;
  /** Primary brand color for the filled state. Defaults to amber-500. */
  activeColor?: string;
  className?: string;
  iconSize?: number;
  hideRipple?: boolean;
  children?: React.ReactNode;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorited,
  onFavorite,
  activeColor = "#F59E0B",
  className = "p-2",
  iconSize = 32,
  hideRipple = false,
  children,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onFavorite?.();
      }}
      className={`relative transition-all duration-300 flex items-center justify-center overflow-visible ${className}`}
    >
      {/* Subtle expansion ripple on favorite */}
      {!hideRipple && (
        <AnimatePresence>
          {isFavorited && (
            <motion.div
              key="favorite-ripple"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl pointer-events-none blur-sm"
              style={{ backgroundColor: `${activeColor}66` }}
            />
          )}
        </AnimatePresence>
      )}

      <motion.div
        initial={false}
        animate={{
          scale: isFavorited ? [1, 1.3, 1] : [1, 0.9, 1],
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="flex items-center gap-1.5"
      >
        <Heart 
          size={iconSize}
          className="relative z-10 transition-colors duration-500 hover:text-white"
          style={
            isFavorited
              ? {
                  color: activeColor,
                  fill: activeColor,
                  filter: `drop-shadow(0 0 12px ${activeColor}99)`,
                }
              : {
                  color: "rgba(255, 255, 255, 0.4)",
                  fill: "transparent",
                }
          }
        />
        {children}
      </motion.div>
    </motion.button>
  );
};
