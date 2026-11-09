import Link from "next/link";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-6xl sm:text-8xl" : "text-2xl";
  return (
    <Link href="/" aria-label="Top10 home" className={`font-display ${text} leading-none tracking-tight`}>
      <span className="text-bone">TOP</span>
      <span className="inline-block -skew-x-6 bg-accent px-[0.12em] text-ink">10</span>
    </Link>
  );
}
