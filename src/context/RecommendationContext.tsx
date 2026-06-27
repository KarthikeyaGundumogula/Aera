import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

/**
 * RecommendationContext — Split into two separate contexts:
 *
 *  1. RecommendationActionsContext  → holds STABLE callbacks only (openRecommendation, closeRecommendation)
 *     Consumers: any component that needs to *trigger* the modal (cards, tiles, etc.)
 *     Re-renders: NEVER — callbacks are memoized with useCallback and their references never change.
 *
 *  2. RecommendationStateContext → holds VOLATILE state (isOpen, startIndex)
 *     Consumers: only the RecommendationModal itself
 *     Re-renders: only the modal, on every open/close — not every card in the feed.
 *
 * This pattern prevents the entire card list from re-rendering every time the modal opens/closes.
 */

interface RecommendationState {
  isOpen: boolean;
  startIndex: number;
}

interface RecommendationActions {
  openRecommendation: (startIndex?: number) => void;
  closeRecommendation: () => void;
}

const RecommendationStateContext = createContext<RecommendationState | undefined>(undefined);
const RecommendationActionsContext = createContext<RecommendationActions | undefined>(undefined);

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

  // Stable actions object — never causes re-renders in action consumers
  const actions = useMemo(
    () => ({ openRecommendation, closeRecommendation }),
    [openRecommendation, closeRecommendation]
  );

  // Volatile state — only the modal subscribes to this
  const state = useMemo(
    () => ({ isOpen, startIndex }),
    [isOpen, startIndex]
  );

  return (
    <RecommendationActionsContext.Provider value={actions}>
      <RecommendationStateContext.Provider value={state}>
        {children}
      </RecommendationStateContext.Provider>
    </RecommendationActionsContext.Provider>
  );
}

/** Use this in cards/tiles that need to open the modal. Will NEVER cause re-renders on open/close. */
export function useRecommendationActions(): RecommendationActions {
  const ctx = useContext(RecommendationActionsContext);
  if (!ctx) {
    throw new Error("useRecommendationActions must be used inside a RecommendationProvider");
  }
  return ctx;
}

/** Use this ONLY in RecommendationModal — re-renders on every open/close. */
export function useRecommendationState(): RecommendationState {
  const ctx = useContext(RecommendationStateContext);
  if (!ctx) {
    throw new Error("useRecommendationState must be used inside a RecommendationProvider");
  }
  return ctx;
}

/**
 * @deprecated Use useRecommendationActions() or useRecommendationState() instead.
 * Kept for backwards compatibility during migration — will be removed once all
 * consumers are updated to use the split hooks.
 */
export function useRecommendationContext() {
  const actions = useRecommendationActions();
  const state = useRecommendationState();
  return { ...actions, ...state };
}
