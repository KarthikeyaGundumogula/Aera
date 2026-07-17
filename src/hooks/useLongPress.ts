import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 400 }: UseLongPressOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.PointerEvent) => {
      // Ignore right clicks
      if (e.button !== 0) return;

      isLongPressRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (e?: React.PointerEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // If it wasn't a long press and we have an onClick handler, and it wasn't cancelled by movement
      if (e && !isLongPressRef.current && onClick) {
        if (startPosRef.current) {
          const dx = Math.abs(e.clientX - startPosRef.current.x);
          const dy = Math.abs(e.clientY - startPosRef.current.y);
          // Only fire click if they didn't move their finger much (prevent click on scroll)
          if (dx < 10 && dy < 10) {
            onClick();
          }
        } else {
          onClick();
        }
      }
      
      startPosRef.current = null;
    },
    [onClick]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Prevent default context menu on touch devices when long pressing
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}
