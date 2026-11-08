"use client";

import { useCallback, useState } from "react";

/**
 * Countdown state machine.
 *   step -1        intro card
 *   step 0..n-1    items, in countdown order (#10 first, #1 last)
 *   step n         finale card
 *
 * `canAdvance` lets a later mode (e.g. Quiz: "guess the #1 first") block
 * moving forward until the player has done something.
 */
export function useCountdown(count: number, canAdvance?: (fromStep: number) => boolean) {
  const [{ step, direction }, setState] = useState<{ step: number; direction: 1 | -1 }>({
    step: -1,
    direction: 1,
  });

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(-1, Math.min(count, target));
      setState((s) => (clamped === s.step ? s : { step: clamped, direction: clamped > s.step ? 1 : -1 }));
    },
    [count],
  );

  const next = useCallback(() => {
    setState((s) => {
      if (s.step >= count) return s;
      if (canAdvance && !canAdvance(s.step)) return s;
      return { step: s.step + 1, direction: 1 };
    });
  }, [count, canAdvance]);

  const prev = useCallback(() => {
    setState((s) => (s.step <= -1 ? s : { step: s.step - 1, direction: -1 }));
  }, []);

  const restart = useCallback(() => goTo(-1), [goTo]);

  return {
    step,
    direction,
    next,
    prev,
    goTo,
    restart,
    isIntro: step === -1,
    isFinale: step === count,
    isLastItem: step === count - 1,
  };
}
