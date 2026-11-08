"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TOPIC_MAX, TOPIC_MIN } from "@/lib/schema";
import { listHref } from "@/lib/content";

export function TopicForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = topic.trim();
    if (value.length < TOPIC_MIN) {
      setError("Give me a little more to work with!");
      return;
    }
    router.push(listHref(value));
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="topic" className="mb-3 block font-display text-2xl uppercase tracking-wide text-mute sm:text-3xl">
        Give me a Top 10 of…
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="topic"
          name="topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setError(null);
          }}
          maxLength={TOPIC_MAX}
          autoComplete="off"
          autoFocus
          placeholder="the weirdest animals on Earth"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "topic-error" : undefined}
          className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-ink-2 px-5 py-4 text-xl text-bone placeholder:text-mute/60 outline-none transition focus:border-accent sm:text-2xl"
        />
        <button
          type="submit"
          className="rounded-2xl bg-accent px-8 py-4 font-display text-2xl uppercase tracking-wide text-ink shadow-[5px_5px_0_0_rgba(255,61,46,0.9)] transition hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          Count it down
        </button>
      </div>
      {error && (
        <p id="topic-error" role="alert" className="mt-2 text-hot">
          {error}
        </p>
      )}
    </form>
  );
}
