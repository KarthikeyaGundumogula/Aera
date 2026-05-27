import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CenterFeedLayout } from "./layouts/CenterFeedLayout";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/** Key used to remember that a desktop redirect has already happened this session. */
const DESKTOP_REDIRECT_KEY = 'hasVisitedDesktop';

export function CenterPage() {
  const isMobile = useMediaQuery();
  const navigate = useNavigate();

  // Auto-redirect to Theatre for Desktop/Tablet on first load
  useEffect(() => {
    const hasVisited = sessionStorage.getItem(DESKTOP_REDIRECT_KEY);
    if (!isMobile && !hasVisited) {
      sessionStorage.setItem(DESKTOP_REDIRECT_KEY, 'true');
      navigate('/theatre', { replace: true });
    }
  }, [isMobile, navigate]);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <CenterFeedLayout />
    </div>
  );
}
