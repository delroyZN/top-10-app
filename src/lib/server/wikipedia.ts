import "server-only";
import { fetchJson } from "./http";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

export interface WikiPage {
  /** Canonical title after redirects. */
  title: string;
  url: string;
  /** File name (without "File:") of the article's free lead image, if any. */
  pageImage?: string;
}

interface QueryResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: {
      title: string;
      missing?: boolean;
      invalid?: boolean;
      fullurl?: string;
      pageimage?: string;
      pageprops?: { disambiguation?: string };
    }[];
  };
}

/**
 * Look up many Wikipedia titles in one request. Returns a map keyed by the
 * title we asked for. Titles that don't exist, or are disambiguation pages,
 * are left out, so a made-up title never becomes a source link.
 */
export async function lookupWikipediaPages(titles: string[]): Promise<Map<string, WikiPage>> {
  const result = new Map<string, WikiPage>();
  const unique = [...new Set(titles.map((t) => t.trim()).filter(Boolean))];
  if (!unique.length) return result;

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    redirects: "1",
    prop: "info|pageimages|pageprops",
    inprop: "url",
    piprop: "name",
    ppprop: "disambiguation",
    titles: unique.join("|"),
  });
  const data = await fetchJson<QueryResponse>(`${WIKI_API}?${params}`);
  const pages = data?.query?.pages;
  if (!pages) return result;

  const byTitle = new Map(pages.map((p) => [p.title, p]));
  const normalized = new Map(data.query?.normalized?.map((n) => [n.from, n.to]));
  const redirects = new Map(data.query?.redirects?.map((r) => [r.from, r.to]));

  for (const asked of unique) {
    let title = normalized.get(asked) ?? asked;
    title = redirects.get(title) ?? title;
    const page = byTitle.get(title);
    if (!page || page.missing || page.invalid || !page.fullurl) continue;
    if (page.pageprops?.disambiguation !== undefined) continue;
    result.set(asked, { title: page.title, url: page.fullurl, pageImage: page.pageimage });
  }
  return result;
}
