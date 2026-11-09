import { z } from "zod";

/**
 * Shared types and schemas. This file is safe to import on both the server
 * and the client (no secrets, no server-only code).
 *
 * Later phases (fact cards, quiz, fact of the day) should add their own
 * schemas here next to the Top 10 ones and reuse `ImageInfo` / `SourceInfo`.
 */

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export const TOPIC_MIN = 3;
export const TOPIC_MAX = 120;

export const GenerateRequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(TOPIC_MIN, `Topic must be at least ${TOPIC_MIN} characters.`)
    .max(TOPIC_MAX, `Topic must be at most ${TOPIC_MAX} characters.`),
});

// ---------------------------------------------------------------------------
// What Claude returns
// ---------------------------------------------------------------------------

/**
 * Shape sent to the API as the structured-output format. Kept free of
 * constraints (min/max etc.) so it maps cleanly onto JSON Schema; the
 * stricter rules live in `TopListSchema` below.
 */
export const RawTopListItemSchema = z.object({
  rank: z.number(),
  name: z.string(),
  blurb: z.string(),
  didYouKnow: z.string(),
  imageQuery: z.string(),
  wikipediaTitle: z.string(),
});

export const RawTopListSchema = z.object({
  title: z.string(),
  intro: z.string(),
  items: z.array(RawTopListItemSchema),
});

const nonEmpty = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} must not be empty`)
    .max(max, `${field} is too long (max ${max} characters)`);

export const TopListItemSchema = z.object({
  rank: z.number().int().min(1).max(10),
  name: nonEmpty("name", 120),
  blurb: nonEmpty("blurb", 700),
  didYouKnow: nonEmpty("didYouKnow", 400),
  imageQuery: nonEmpty("imageQuery", 120),
  wikipediaTitle: z.string().trim().max(200),
});

/** Strict validation applied to Claude's answer before we trust it. */
export const TopListSchema = z
  .object({
    title: nonEmpty("title", 140),
    intro: nonEmpty("intro", 500),
    items: z.array(TopListItemSchema).length(10, "items must contain exactly 10 entries"),
  })
  .superRefine((list, ctx) => {
    const ranks = new Set(list.items.map((i) => i.rank));
    if (ranks.size !== 10) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "each rank from 1 to 10 must appear exactly once",
      });
    }
  });

export type TopListItem = z.infer<typeof TopListItemSchema>;
export type TopList = z.infer<typeof TopListSchema>;

// ---------------------------------------------------------------------------
// What the API route returns to the browser
// ---------------------------------------------------------------------------

export type ImageProvider = "wikimedia" | "unsplash" | "placeholder";

export interface ImageInfo {
  provider: ImageProvider;
  /** Absent for placeholders. */
  url?: string;
  alt: string;
  author?: string;
  authorUrl?: string;
  licence?: string;
  licenceUrl?: string;
  /** Page for the image itself (Commons file page / Unsplash photo page). */
  sourceUrl?: string;
}

export interface SourceInfo {
  title: string;
  url: string;
}

export interface EnrichedItem extends TopListItem {
  image: ImageInfo;
  source: SourceInfo | null;
}

export interface EnrichedTopList {
  topic: string;
  title: string;
  intro: string;
  /** Always sorted from rank 10 down to rank 1. */
  items: EnrichedItem[];
  generatedAt: string;
}

export type GenerateErrorCode =
  | "invalid_topic"
  | "rate_limited"
  | "generation_failed"
  | "upstream_busy"
  | "refused"
  | "misconfigured"
  | "internal";

export interface GenerateErrorBody {
  error: { code: GenerateErrorCode; message: string };
}

export type GenerateResponse = { list: EnrichedTopList } | GenerateErrorBody;
