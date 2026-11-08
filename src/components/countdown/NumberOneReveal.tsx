"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { EnrichedItem } from "@/lib/schema";
import { CountdownItem } from "./CountdownItem";

const DRUMROLL_MS = 2200;

/** Deterministic pseudo-random in [0, 1), so renders stay pure. */
const rand = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const PIECES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  x: (rand(i, 1) - 0.5) * 900,
  y: -(200 + rand(i, 2) * 380),
  rotate: rand(i, 3) * 720 - 360,
  color: ["#ffc93c", "#ffd60a", "#ff3d2e", "#f4f1ea"][i % 4],
  delay: rand(i, 4) * 0.15,
  w: 6 + rand(i, 5) * 8,
}));

function Confetti() {
  const pieces = PIECES;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block rounded-sm"
          style={{ width: p.w, height: p.w * 1.6, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 700], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 2.4, delay: p.delay, ease: "easeOut", times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}

function Drumroll() {
  return (
    <motion.div
      key="drumroll"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.3, filter: "blur(8px)" }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
    >
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-display text-2xl uppercase tracking-[0.3em] text-mute sm:text-3xl"
      >
        And the number one spot goes to…
      </motion.p>
      <motion.span
        className="font-display text-[10rem] leading-none text-gold sm:text-[14rem]"
        animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 0.45, repeat: Infinity }}
      >
        #1
      </motion.span>
      <div className="flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-3 w-3 rounded-full bg-gold"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/** Extra-dramatic reveal for #1: drumroll, then spotlight, rays and confetti. */
export function NumberOneReveal({ item }: { item: EnrichedItem }) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(Boolean(reduce));

  useEffect(() => {
    if (revealed) return;
    const t = setTimeout(() => setRevealed(true), DRUMROLL_MS);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div className="relative" aria-live="polite">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <Drumroll />
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative"
          >
            {/* Rotating light rays behind the slide */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-30"
                style={{
                  background:
                    "repeating-conic-gradient(from 0deg, rgba(255,201,60,0.35) 0deg 8deg, transparent 8deg 24deg)",
                  maskImage: "radial-gradient(circle, black 10%, transparent 55%)",
                  WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 55%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            )}
            {!reduce && <Confetti />}
            <CountdownItem item={item} gold />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
