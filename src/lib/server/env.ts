import "server-only";

/**
 * Server-side configuration. Values come from .env.local and are never sent
 * to the browser (nothing here is prefixed with NEXT_PUBLIC_).
 */

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY ?? "",
  claudeModel: process.env.CLAUDE_MODEL || "claude-opus-5-5",
  claudeEffort: (process.env.CLAUDE_EFFORT || "low") as "low" | "medium" | "high",
  rateLimit: {
    perMinute: intFromEnv("RATE_LIMIT_PER_MINUTE", 5),
    perHour: intFromEnv("RATE_LIMIT_PER_HOUR", 30),
  },
  /** Identifies us to Wikimedia, as their API etiquette asks. */
  userAgent: "Top10App/0.1 (https://github.com/delroyZN/top-10-app)",
};
