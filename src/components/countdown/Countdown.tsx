"use client";

import { AnimatePresence, motion, type PanInfo, type Variants } from "framer-motion";
import type { EnrichedTopList } from "@/lib/schema";
import { useCountdown } from "@/hooks/useCountdown";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { Button } from "@/components/ui/Button";
import { CountdownItem } from "./CountdownItem";
import { FinaleCard } from "./FinaleCard";
import { IntroCard } from "./IntroCard";
import { NumberOneReveal } from "./NumberOneReveal";
import { ProgressRail } from "./ProgressRail";

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -80, transition: { duration: 0.2 } }),
};

const SWIPE_PX = 70;

export function Countdown({ list, onShowAll }: { list: EnrichedTopList; onShowAll: () => void }) {
  const { items } = list;
  const cd = useCountdown(items.length);
  useKeyboardNav({ onNext: cd.next, onPrev: cd.prev });

  const item = cd.step >= 0 && cd.step < items.length ? items[cd.step] : null;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) cd.next();
    else if (info.offset.x > SWIPE_PX) cd.prev();
  }

  const nextLabel = cd.isIntro
    ? "Start"
    : cd.isLastItem
      ? "Finish"
      : cd.step === items.length - 2
        ? "Reveal #1"
        : `Next: #${items[cd.step + 1]?.rank ?? ""}`;

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1 overflow-x-clip">
        <AnimatePresence mode="wait" custom={cd.direction} initial={false}>
          <motion.div
            key={cd.step}
            custom={cd.direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            drag={cd.isIntro || cd.isFinale ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            dragDirectionLock
            onDragEnd={onDragEnd}
            className="touch-pan-y py-4 sm:py-8"
          >
            {cd.isIntro && <IntroCard title={list.title} intro={list.intro} onStart={cd.next} />}
            {item && item.rank === 1 && <NumberOneReveal item={item} />}
            {item && item.rank !== 1 && <CountdownItem item={item} />}
            {cd.isFinale && <FinaleCard title={list.title} onReplay={cd.restart} onShowAll={onShowAll} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {!cd.isIntro && !cd.isFinale && (
        <div className="sticky bottom-0 -mx-4 mt-2 border-t border-line/60 bg-ink/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            <ProgressRail ranks={items.map((i) => i.rank)} currentIndex={cd.step} onJump={cd.goTo} />
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={cd.prev} aria-label="Previous">
                ◂ <span className="hidden sm:inline">Back</span>
              </Button>
              <Button onClick={cd.next} className={`flex-1 sm:flex-none sm:min-w-56 ${cd.step === items.length - 2 ? "!bg-gold" : ""}`}>
                {nextLabel} ▸
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
