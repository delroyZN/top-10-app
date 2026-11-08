export function DidYouKnow({ fact, gold = false }: { fact: string; gold?: boolean }) {
  return (
    <div
      className={`relative rounded-xl border-l-4 bg-ink-2/80 p-4 ${gold ? "border-gold" : "border-hot"}`}
    >
      <p className={`mb-1 font-display text-sm uppercase tracking-[0.2em] ${gold ? "text-gold" : "text-hot"}`}>
        Did you know?
      </p>
      <p className="text-base leading-relaxed text-bone/90">{fact}</p>
    </div>
  );
}
