import "server-only";
import type { ImageInfo } from "@/lib/schema";
import { searchCommons } from "./wikimedia";
import { searchUnsplash } from "./unsplash";

export interface ImageRequest {
  name: string;
  imageQuery: string;
  /** True when the item has a verified Wikipedia article (a specific thing). */
  isSpecific: boolean;
  /** Commons lead image for that article, if one was found up front. */
  leadImage?: Omit<ImageInfo, "alt">;
}

export function placeholderImage(alt: string): ImageInfo {
  return { provider: "placeholder", alt };
}

/**
 * Image fallback chain for one item:
 *   1. the Wikipedia article's free lead image (Wikimedia Commons)
 *   2. Commons search (for specific people/places/animals/things)
 *   3. Unsplash search (best for general/abstract entries)
 *   4. Commons search for abstract entries, as a last try
 *   5. a styled placeholder
 */
export async function resolveImage(req: ImageRequest): Promise<ImageInfo> {
  const alt = req.name;
  if (req.leadImage) return { ...req.leadImage, alt };

  const query = req.imageQuery || req.name;
  const chain = req.isSpecific
    ? [() => searchCommons(query, alt), () => searchUnsplash(query, alt)]
    : [() => searchUnsplash(query, alt), () => searchCommons(query, alt)];

  for (const next of chain) {
    const found = await next();
    if (found) return found;
  }
  return placeholderImage(alt);
}
