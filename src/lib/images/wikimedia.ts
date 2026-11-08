import "server-only";
import type { ImageInfo } from "@/lib/schema";
import { fetchJson, stripHtml } from "@/lib/server/http";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const THUMB_WIDTH = "1280";
const USABLE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ExtValue {
  value?: string;
}
interface CommonsPage {
  title: string;
  missing?: boolean;
  index?: number;
  imageinfo?: {
    url: string;
    thumburl?: string;
    width?: number;
    mime?: string;
    descriptionurl?: string;
    extmetadata?: {
      Artist?: ExtValue;
      Credit?: ExtValue;
      LicenseShortName?: ExtValue;
      LicenseUrl?: ExtValue;
      ObjectName?: ExtValue;
      Restrictions?: ExtValue;
    };
  }[];
}
interface CommonsResponse {
  query?: { pages?: CommonsPage[] };
}

const BASE_PARAMS = {
  action: "query",
  format: "json",
  formatversion: "2",
  prop: "imageinfo",
  iiprop: "url|mime|size|extmetadata",
  iiurlwidth: THUMB_WIDTH,
  iiextmetadatafilter: "Artist|Credit|LicenseShortName|LicenseUrl|ObjectName|Restrictions",
};

function toImageInfo(page: CommonsPage, alt: string): ImageInfo | null {
  const info = page.imageinfo?.[0];
  if (!info || page.missing) return null;
  if (info.mime && !USABLE_MIME.has(info.mime)) return null;
  if (info.width && info.width < 400) return null;

  const meta = info.extmetadata ?? {};
  const licence = stripHtml(meta.LicenseShortName?.value);
  // Credit/licence is required: skip files that don't declare one.
  if (!licence) return null;

  return {
    provider: "wikimedia",
    url: info.thumburl ?? info.url,
    alt,
    author: stripHtml(meta.Artist?.value) ?? stripHtml(meta.Credit?.value) ?? "Unknown author",
    licence,
    licenceUrl: meta.LicenseUrl?.value,
    sourceUrl: info.descriptionurl,
  };
}

/**
 * Fetch Commons details for many files at once (the lead images of the
 * Wikipedia articles). Keyed by file name. Files that only exist on English
 * Wikipedia (usually non-free "fair use" images) are not on Commons and are
 * skipped on purpose.
 */
export async function getCommonsFiles(
  fileNames: string[],
): Promise<Map<string, Omit<ImageInfo, "alt">>> {
  const out = new Map<string, Omit<ImageInfo, "alt">>();
  const unique = [...new Set(fileNames.filter(Boolean))];
  if (!unique.length) return out;

  const titles = unique.map((f) => `File:${f.replace(/_/g, " ")}`);
  const params = new URLSearchParams({ ...BASE_PARAMS, titles: titles.join("|") });
  const data = await fetchJson<CommonsResponse>(`${COMMONS_API}?${params}`);

  for (const page of data?.query?.pages ?? []) {
    const info = toImageInfo(page, "");
    if (!info) continue;
    const name = page.title.replace(/^File:/, "");
    // Store under both spellings so callers can look up either.
    out.set(name, info);
    out.set(name.replace(/ /g, "_"), info);
  }
  return out;
}

/** Full-text search on Commons for a photo matching the query. */
export async function searchCommons(query: string, alt: string): Promise<ImageInfo | null> {
  const params = new URLSearchParams({
    ...BASE_PARAMS,
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "6",
  });
  const data = await fetchJson<CommonsResponse>(`${COMMONS_API}?${params}`);
  const pages = [...(data?.query?.pages ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const page of pages) {
    const info = toImageInfo(page, alt);
    if (info) return info;
  }
  return null;
}
