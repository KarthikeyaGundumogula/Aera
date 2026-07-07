import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

/**
 * RecommendationContext — manages global recommendation modal state.
 *
 * Provides openRecommendation / closeRecommendation actions and the
 * isOpen / startIndex state. Both are co-located here since the only
 * consumer (GlobalActionFAB) needs both at once.
 */

interface RecommendationState {
  isOpen: boolean;
  startIndex: number;
  openRecommendation: (startIndex?: number) => void;
  closeRecommendation: () => void;
}

const RecommendationContext = createContext<RecommendationState | undefined>(undefined);

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openRecommendation = useCallback((index = 0) => {
    setStartIndex(index);
    setIsOpen(true);
  }, []);

  const closeRecommendation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, startIndex, openRecommendation, closeRecommendation }),
    [isOpen, startIndex, openRecommendation, closeRecommendation]
  );

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendationContext(): RecommendationState {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendationContext must be used inside a RecommendationProvider");
  }
  return ctx;
}
