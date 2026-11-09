import type { SourceInfo } from "@/lib/schema";

export function SourceLink({ source }: { source: SourceInfo | null }) {
  if (!source) return null;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-mute transition hover:text-accent"
    >
      <span aria-hidden className="grid h-5 w-5 place-items-center rounded bg-bone font-serif text-xs font-bold text-ink">
        W
      </span>
      Read more on Wikipedia: <span className="underline underline-offset-2">{source.title}</span>
    </a>
  );
}
