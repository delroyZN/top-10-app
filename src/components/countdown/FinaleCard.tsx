"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinaleCard({
  title,
  onReplay,
  onShowAll,
}: {
  title: string;
  onReplay: () => void;
  onShowAll: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
    >
      <p className="font-display text-xl uppercase tracking-[0.3em] text-mute">That&apos;s a wrap</p>
      <h2 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] sm:text-7xl">{title}</h2>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onShowAll}>See the full list</Button>
        <Button variant="ghost" onClick={onReplay}>
          Watch again
        </Button>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-line px-5 py-3 font-display text-lg uppercase tracking-wide hover:border-bone hover:bg-ink-3"
        >
          New topic
        </Link>
      </div>
    </motion.div>
  );
}
