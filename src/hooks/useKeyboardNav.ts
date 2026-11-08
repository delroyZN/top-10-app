"use client";

import { useEffect } from "react";

/** Arrow keys (and Space/Enter for "next") drive the countdown. */
export function useKeyboardNav({
  onNext,
  onPrev,
  enabled = true,
}: {
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    function handle(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        // Let Space/Enter activate a focused button normally.
        if (e.key === " " && target?.closest("button, a")) return;
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onNext, onPrev, enabled]);
}
