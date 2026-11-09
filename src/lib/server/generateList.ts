import "server-only";
import type { EnrichedTopList } from "@/lib/schema";
import { generateTopList } from "./claude";
import { enrichTopList } from "./enrich";
import { mockTopList } from "./mockList";
import { normalizeTopic, TtlCache } from "./cache";

const cache = new TtlCache<EnrichedTopList>(30 * 60 * 1000);
const inFlight = new Map<string, Promise<EnrichedTopList>>();

export function getCachedList(topic: string): EnrichedTopList | undefined {
  return cache.get(normalizeTopic(topic));
}

/**
 * Generate (or reuse) a full Top 10 list with images and sources.
 * Concurrent requests for the same topic share one generation.
 */
export async function getTopList(topic: string): Promise<EnrichedTopList> {
  const key = normalizeTopic(topic);
  const cached = cache.get(key);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const job = (async () => {
    const started = Date.now();
    const list = process.env.MOCK_GENERATION === "1" ? mockTopList(topic) : await generateTopList(topic);
    const enriched = await enrichTopList(topic, list);
    const images = enriched.items.map((i) => i.image.provider);
    console.info(
      `[generate] "${topic}" in ${((Date.now() - started) / 1000).toFixed(1)}s ` +
        `(wikimedia ${images.filter((p) => p === "wikimedia").length}, ` +
        `unsplash ${images.filter((p) => p === "unsplash").length}, ` +
        `placeholder ${images.filter((p) => p === "placeholder").length})`,
    );
    cache.set(key, enriched);
    return enriched;
  })();

  inFlight.set(key, job);
  try {
    return await job;
  } finally {
    inFlight.delete(key);
  }
}
