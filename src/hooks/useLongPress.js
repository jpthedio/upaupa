import { useRef, useCallback } from "react";

/**
 * Long-press hook using Pointer Events.
 * Returns bind props to spread on the target element.
 * Calls `onLongPress` after `delay` ms if pointer hasn't moved > `threshold` px.
 * Exposes `wasLongPress()` so the parent can suppress the click that fires after release.
 */
export function useLongPress(onLongPress, { delay = 500, threshold = 10 } = {}) {
  const timerRef = useRef(null);
  const startPos = useRef(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback((e) => {
    // Only primary button / single touch
    if (e.button !== 0) return;
    firedRef.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress(e);
    }, delay);
  }, [onLongPress, delay]);

  const onPointerMove = useCallback((e) => {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      clear();
    }
  }, [clear, threshold]);

  const onPointerUp = useCallback(() => {
    clear();
    startPos.current = null;
  }, [clear]);

  const onPointerCancel = useCallback(() => {
    clear();
    startPos.current = null;
    firedRef.current = false;
  }, [clear]);

  const onContextMenu = useCallback((e) => {
    // Prevent native context menu when long-press fires
    if (firedRef.current) {
      e.preventDefault();
    }
  }, []);

  /** Call this in onClick to check if it was a long-press (suppress the click). */
  const wasLongPress = useCallback(() => {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onContextMenu },
    wasLongPress,
  };
}
