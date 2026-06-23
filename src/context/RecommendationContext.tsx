import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface RecommendationContextValue {
  isOpen: boolean;
  startIndex: number;
  openRecommendation: (startIndex?: number) => void;
  closeRecommendation: () => void;
}

const RecommendationContext = createContext<RecommendationContextValue | undefined>(undefined);

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

  return (
    <RecommendationContext.Provider
      value={{ isOpen, startIndex, openRecommendation, closeRecommendation }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendationContext(): RecommendationContextValue {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendationContext must be used inside a RecommendationProvider");
  }
  return ctx;
}
