"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTopList } from "@/hooks/useTopList";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { ErrorState } from "@/components/ui/ErrorState";
import { Logo } from "@/components/ui/Logo";
import { TOPIC_MIN } from "@/lib/schema";
import { Countdown } from "./Countdown";
import { ShowAllList } from "./ShowAllList";

const ERROR_TITLES: Record<string, string> = {
  rate_limited: "Easy, tiger!",
  refused: "Let's try another topic",
  misconfigured: "The app isn't set up yet",
  invalid_topic: "Hmm, that topic didn't work",
};

function ListBody({ topic }: { topic: string }) {
  const result = useTopList(topic);
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-4 py-4">
        <Logo />
        {result.status === "ready" && (
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-pressed={showAll}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-bone transition hover:border-accent hover:text-accent"
          >
            <span
              aria-hidden
              className={`relative h-4 w-7 rounded-full transition ${showAll ? "bg-accent" : "bg-line"}`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-ink transition-all ${showAll ? "left-3.5" : "left-0.5 bg-bone"}`}
              />
            </span>
            Show all
          </button>
        )}
      </header>

      {result.status === "loading" && <LoadingScreen topic={topic} />}
      {result.status === "error" && (
        <ErrorState
          title={ERROR_TITLES[result.error.code]}
          message={result.error.message}
          onRetry={result.error.code === "invalid_topic" ? undefined : result.retry}
        />
      )}
      {result.status === "ready" &&
        (showAll ? (
          <div className="pb-12">
            <ShowAllList list={result.list} />
          </div>
        ) : (
          <Countdown list={result.list} onShowAll={() => setShowAll(true)} />
        ))}
    </>
  );
}

export function ListScreen() {
  const topic = (useSearchParams().get("topic") ?? "").trim();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
      {topic.length < TOPIC_MIN ? (
        <>
          <header className="py-4">
            <Logo />
          </header>
          <ErrorState title="No topic yet" message="Head back and tell us what you want a Top 10 of." />
        </>
      ) : (
        // key resets all state when the topic changes
        <ListBody key={topic} topic={topic} />
      )}
    </main>
  );
}
