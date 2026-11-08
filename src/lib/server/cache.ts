import "server-only";

/**
 * Tiny in-memory TTL cache, so reloading a list (or two people asking for
 * the same topic) doesn't pay for a second Claude call.
 */
export class TtlCache<V> {
  private store = new Map<string, { value: V; expires: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 200,
  ) {}

  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V) {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

export const normalizeTopic = (topic: string) => topic.trim().toLowerCase().replace(/\s+/g, " ");
