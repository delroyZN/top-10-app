import "server-only";
import { config } from "./env";

/**
 * Small fetch wrapper for third-party JSON APIs (Wikipedia, Commons,
 * Unsplash): adds a timeout and a User-Agent, and returns null instead of
 * throwing so one slow or broken source never takes down a whole list.
 */
export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T | null> {
  const { timeoutMs = 8000, headers, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      headers: { "User-Agent": config.userAgent, Accept: "application/json", ...headers },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[http] ${res.status} from ${new URL(url).host}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[http] request to ${new URL(url).host} failed:`, (err as Error).message);
    return null;
  }
}

/** Strip HTML tags/entities from Commons metadata (author fields are HTML). */
export function stripHtml(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}
