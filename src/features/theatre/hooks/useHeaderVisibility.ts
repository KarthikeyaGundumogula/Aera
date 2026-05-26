import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook to manage header visibility based on scroll and mouse position.
 */
export function useHeaderVisibility() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollYRef = useRef(0);
  const lastYRef = useRef(0);

  const handleScroll = useCallback((y: number) => {
    const dy = y - lastYRef.current;
    lastYRef.current = y;
    scrollYRef.current = y;

    setIsScrolled(Math.abs(y) > 10);

    // Show header if we're near the top or scrolling up
    if (y > -10) {
      setIsHeaderVisible(true);
    } else if (dy > 2) {
      setIsHeaderVisible(true);
    } else if (dy < -2) {
      setIsHeaderVisible(false);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // If mouse is near top, show header
      if (e.clientY < 60) {
        setIsHeaderVisible(true);
      } else if (Math.abs(scrollYRef.current) > 10) {
        setIsHeaderVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return { isHeaderVisible, isScrolled, handleScroll };
}
