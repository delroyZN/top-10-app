import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-ink hover:bg-bone shadow-[4px_4px_0_0_rgba(0,0,0,0.6)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ghost: "border border-line text-bone hover:border-bone hover:bg-ink-3",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-lg uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles[variant]} ${className}`}
    />
  );
}
