import Link from "next/link";
import { EXAMPLE_TOPICS, listHref } from "@/lib/content";

export function ExampleTopics() {
  return (
    <div>
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mute">Or try one of these</p>
      <ul className="flex flex-wrap gap-2">
        {EXAMPLE_TOPICS.map((topic) => (
          <li key={topic}>
            <Link
              href={listHref(topic)}
              className="inline-block rounded-full border border-line bg-ink-2 px-4 py-2 text-sm text-bone transition hover:-translate-y-0.5 hover:border-accent hover:text-accent sm:text-base"
            >
              {topic}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
