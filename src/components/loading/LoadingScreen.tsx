"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/content";

export function LoadingScreen({ topic }: { topic: string }) {
  const [msg, setMsg] = useState(0);
  const [num, setNum] = useState(10);

  useEffect(() => {
    const m = setInterval(() => setMsg((i) => (i + 1) % LOADING_MESSAGES.length), 2600);
    const n = setInterval(() => setNum((i) => (i <= 1 ? 10 : i - 1)), 650);
    return () => {
      clearInterval(m);
      clearInterval(n);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-dashed border-accent/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={num}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`font-display text-8xl leading-none sm:text-9xl ${num === 1 ? "text-gold" : "text-bone"}`}
          >
            {num}
          </motion.span>
        </AnimatePresence>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-mute">Building your Top 10</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl uppercase leading-tight sm:text-5xl">{topic}</h1>
      </div>

      <div className="h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg text-accent"
          >
            {LOADING_MESSAGES[msg]}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="text-xs text-mute">This usually takes 20 to 40 seconds.</p>
    </div>
  );
}
