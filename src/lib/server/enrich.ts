import "server-only";
import type { EnrichedItem, EnrichedTopList, TopList } from "@/lib/schema";
import { getCommonsFiles } from "@/lib/images/wikimedia";
import { placeholderImage, resolveImage } from "@/lib/images/resolveImage";
import { lookupWikipediaPages } from "./wikipedia";

/**
 * Turn Claude's list into what the UI shows: verify Wikipedia titles (for
 * source links) and attach an image with credit to every item.
 * Batched where the APIs allow it, parallel everywhere else.
 */
export async function enrichTopList(topic: string, list: TopList): Promise<EnrichedTopList> {
  const pages = await lookupWikipediaPages(list.items.map((i) => i.wikipediaTitle));
  const leadImages = await getCommonsFiles(
    [...pages.values()].map((p) => p.pageImage ?? "").filter(Boolean),
  );

  const items: EnrichedItem[] = await Promise.all(
    list.items.map(async (item) => {
      const page = item.wikipediaTitle ? pages.get(item.wikipediaTitle.trim()) : undefined;
      const leadImage = page?.pageImage ? leadImages.get(page.pageImage) : undefined;
      const image = await resolveImage({
        name: item.name,
        imageQuery: item.imageQuery,
        isSpecific: Boolean(page),
        leadImage,
      }).catch(() => placeholderImage(item.name));
      return {
        ...item,
        image,
        source: page ? { title: page.title, url: page.url } : null,
      };
    }),
  );

  return {
    topic,
    title: list.title,
    intro: list.intro,
    items,
    generatedAt: new Date().toISOString(),
  };
}
