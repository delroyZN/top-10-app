"use client";

import { motion } from "framer-motion";

/** Ten ticks, #10 on the left to #1 on the right; click one to jump to it. */
export function ProgressRail({
  ranks,
  currentIndex,
  onJump,
}: {
  ranks: number[];
  /** Index into `ranks` of the item on screen, or -1 for none. */
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav aria-label="Countdown progress" className="flex items-center gap-1 sm:gap-1.5">
      {ranks.map((rank, i) => {
        const active = i === currentIndex;
        const seen = currentIndex >= 0 && i < currentIndex;
        const isOne = rank === 1;
        return (
          <button
            key={rank}
            onClick={() => onJump(i)}
            aria-label={`Jump to number ${rank}`}
            aria-current={active ? "step" : undefined}
            className="group relative flex h-8 flex-1 items-center sm:h-9"
          >
            <span
              className={`h-1.5 w-full rounded-full transition-colors ${
                active ? (isOne ? "bg-gold" : "bg-accent") : seen ? "bg-bone/50" : "bg-line group-hover:bg-mute"
              }`}
            />
            {active && (
              <motion.span
                layoutId="rail-dot"
                className={`absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-sm text-ink sm:h-8 sm:w-8 ${isOne ? "bg-gold" : "bg-accent"}`}
              >
                {rank}
              </motion.span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
