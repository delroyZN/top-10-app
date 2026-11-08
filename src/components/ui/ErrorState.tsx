"use client";

import Link from "next/link";
import { Button } from "./Button";

export function ErrorState({
  title = "Well, that didn't go to plan",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span aria-hidden className="font-display text-8xl leading-none text-hot">!</span>
      <h1 className="max-w-xl font-display text-4xl uppercase leading-tight sm:text-5xl">{title}</h1>
      <p className="max-w-md text-lg text-mute">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-line px-5 py-3 font-display text-lg uppercase tracking-wide hover:border-bone hover:bg-ink-3"
        >
          New topic
        </Link>
      </div>
    </div>
  );
}
