import "server-only";
import type { ImageInfo } from "@/lib/schema";
import { config } from "@/lib/server/env";
import { fetchJson } from "@/lib/server/http";

const UTM = "utm_source=top10&utm_medium=referral";

interface UnsplashSearch {
  results?: {
    alt_description?: string | null;
    urls: { regular: string };
    links: { html: string };
    user: { name: string; links: { html: string } };
  }[];
}

function withUtm(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${UTM}`;
}

/**
 * Search Unsplash for a photo. Images are hotlinked from Unsplash's CDN and
 * credited with photographer + Unsplash links, as their API guidelines require.
 */
export async function searchUnsplash(query: string, alt: string): Promise<ImageInfo | null> {
  if (!config.unsplashAccessKey) return null;
  const params = new URLSearchParams({
    query,
    per_page: "1",
    orientation: "landscape",
    content_filter: "high",
  });
  const data = await fetchJson<UnsplashSearch>(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${config.unsplashAccessKey}`, "Accept-Version": "v1" },
  });
  const photo = data?.results?.[0];
  if (!photo) return null;
  return {
    provider: "unsplash",
    url: photo.urls.regular,
    alt: photo.alt_description || alt,
    author: photo.user.name,
    authorUrl: withUtm(photo.user.links.html),
    licence: "Unsplash License",
    licenceUrl: withUtm("https://unsplash.com/license"),
    sourceUrl: withUtm(photo.links.html),
  };
}
