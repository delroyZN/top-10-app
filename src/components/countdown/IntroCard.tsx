"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function IntroCard({ title, intro, onStart }: { title: string; intro: string; onStart: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-6">
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-full bg-hot px-3 py-1 font-display text-sm uppercase tracking-[0.25em] text-bone"
      >
        Top 10 countdown
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="max-w-4xl font-display text-5xl uppercase leading-[0.92] sm:text-7xl lg:text-8xl"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl text-lg text-bone/80 sm:text-xl"
      >
        {intro}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Button onClick={onStart} className="px-8 py-4 text-2xl" autoFocus>
          Start the countdown ▸
        </Button>
        <p className="mt-3 hidden text-sm text-mute sm:block">Tip: use the ← → arrow keys</p>
      </motion.div>
    </div>
  );
}
