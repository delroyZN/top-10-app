"use client";

import { motion } from "framer-motion";
import type { EnrichedTopList } from "@/lib/schema";
import { DidYouKnow } from "./DidYouKnow";
import { ImageCredit, ItemImage } from "./ItemImage";
import { SourceLink } from "./SourceLink";

/** The whole list on one page, #10 down to #1. */
export function ShowAllList({ list }: { list: EnrichedTopList }) {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl uppercase leading-[0.95] sm:text-6xl">{list.title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-bone/80">{list.intro}</p>
      </header>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {list.items.map((item, i) => {
          const gold = item.rank === 1;
          return (
            <motion.li
              key={item.rank}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col overflow-hidden rounded-2xl bg-ink-2 ring-1 ${gold ? "ring-gold sm:col-span-2" : "ring-line"}`}
            >
              <div className="relative">
                <ItemImage image={item.image} rank={item.rank} className={gold ? "aspect-[16/9]" : "aspect-[16/10]"} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-2 to-transparent" />
                <div className="absolute bottom-2 left-4 flex items-end gap-3">
                  <span className={`font-display text-7xl leading-none text-shadow-hard ${gold ? "text-gold" : "text-bone"}`}>
                    {item.rank}
                  </span>
                  <h2 className={`pb-1 font-display text-2xl uppercase leading-tight sm:text-3xl ${gold ? "text-gold" : ""}`}>
                    {item.name}
                  </h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4 pt-2">
                <ImageCredit image={item.image} />
                <p className="leading-relaxed text-bone/85">{item.blurb}</p>
                <DidYouKnow fact={item.didYouKnow} gold={gold} />
                <div className="mt-auto">
                  <SourceLink source={item.source} />
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
