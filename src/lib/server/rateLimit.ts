import "server-only";

/**
 * Basic in-memory sliding-window rate limiter, keyed by client IP.
 *
 * Good enough for local use and a single server instance. On serverless or
 * multi-instance hosting, swap `MemoryRateLimiter` for one backed by a shared
 * store (e.g. Upstash Redis or Supabase) that implements the same interface.
 */
export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may try again (only when not allowed). */
  retryAfterSec: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

interface Window {
  limit: number;
  ms: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();
  private readonly longestMs: number;

  constructor(private readonly windows: Window[]) {
    this.longestMs = Math.max(...windows.map((w) => w.ms));
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.longestMs);

    for (const w of this.windows) {
      const inWindow = recent.filter((t) => now - t < w.ms);
      if (inWindow.length >= w.limit) {
        const oldest = inWindow[0];
        this.hits.set(key, recent);
        return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((oldest + w.ms - now) / 1000)) };
      }
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.sweep(now);
    return { allowed: true, retryAfterSec: 0 };
  }

  /** Drop idle keys now and then so the map doesn't grow forever. */
  private sweep(now: number) {
    if (this.hits.size < 1000) return;
    for (const [key, times] of this.hits) {
      if (!times.some((t) => now - t < this.longestMs)) this.hits.delete(key);
    }
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
