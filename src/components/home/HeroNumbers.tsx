"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Decorative stack of rank numbers that drift behind the home hero. */
export function HeroNumbers() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {[10, 7, 4, 1].map((n, i) => (
        <motion.span
          key={n}
          className={`absolute font-display leading-none ${n === 1 ? "rank-outline-gold" : "rank-outline"} opacity-[0.12]`}
          style={{
            fontSize: `${18 + i * 6}rem`,
            right: `${-4 + i * 9}%`,
            top: `${-6 + i * 18}%`,
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 0.12, y: reduce ? 0 : [0, -14, 0] }}
          transition={{
            opacity: { delay: 0.15 * i, duration: 0.8 },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {n}
        </motion.span>
      ))}
    </div>
  );
}
