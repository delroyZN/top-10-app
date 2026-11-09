"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { EnrichedItem } from "@/lib/schema";
import { DidYouKnow } from "./DidYouKnow";
import { ImageCredit, ItemImage } from "./ItemImage";
import { SourceLink } from "./SourceLink";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

/** One full-screen countdown slide. Used for #10–#2 and, in gold, for #1. */
export function CountdownItem({ item, gold = false }: { item: EnrichedItem; gold?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <article className="relative grid w-full gap-6 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10">
      {/* Image column */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: 60, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative"
      >
        <div
          className={`relative overflow-hidden rounded-2xl ring-1 ${gold ? "ring-gold shadow-[0_0_80px_-10px_rgba(255,201,60,0.55)]" : "ring-line shadow-2xl"}`}
        >
          <ItemImage image={item.image} rank={item.rank} priority className="aspect-[4/3] w-full md:aspect-[5/4]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />
          {/* Big rank number, overlapping the image */}
          <motion.div
            initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
            className="absolute bottom-2 left-3 flex items-end leading-none sm:bottom-3 sm:left-4"
          >
            <span className={`font-display text-4xl sm:text-5xl ${gold ? "text-gold" : "text-accent"}`}>#</span>
            <span
              className={`font-display text-[6.5rem] text-shadow-hard sm:text-[9rem] ${gold ? "text-gold" : "text-bone"}`}
            >
              {item.rank}
            </span>
          </motion.div>
        </div>
        <ImageCredit image={item.image} className="mt-2" />
      </motion.div>

      {/* Text column */}
      <motion.div variants={container} initial={reduce ? "show" : "hidden"} animate="show" className="flex flex-col gap-4">
        <motion.h2
          variants={rise}
          className={`font-display text-4xl uppercase leading-[0.95] sm:text-6xl ${gold ? "text-gold" : "text-bone"}`}
        >
          {item.name}
        </motion.h2>
        <motion.p variants={rise} className="text-lg leading-relaxed text-bone/85 sm:text-xl">
          {item.blurb}
        </motion.p>
        <motion.div variants={rise}>
          <DidYouKnow fact={item.didYouKnow} gold={gold} />
        </motion.div>
        <motion.div variants={rise}>
          <SourceLink source={item.source} />
        </motion.div>
      </motion.div>
    </article>
  );
}
