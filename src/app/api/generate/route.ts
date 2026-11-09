import { NextResponse } from "next/server";
import { GenerateRequestSchema, type GenerateErrorBody, type GenerateErrorCode } from "@/lib/schema";
import { GenerationError } from "@/lib/server/claude";
import { getCachedList, getTopList } from "@/lib/server/generateList";
import { clientKey, MemoryRateLimiter } from "@/lib/server/rateLimit";
import { config } from "@/lib/server/env";

// Claude can take a while on a full list; allow up to 2 minutes on hosts that honour this.
export const maxDuration = 120;

const limiter = new MemoryRateLimiter([
  { limit: config.rateLimit.perMinute, ms: 60_000 },
  { limit: config.rateLimit.perHour, ms: 60 * 60_000 },
]);

function errorResponse(code: GenerateErrorCode, message: string, status: number, headers?: HeadersInit) {
  const body: GenerateErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status, headers });
}

const STATUS: Record<GenerationError["code"], number> = {
  generation_failed: 502,
  upstream_busy: 503,
  refused: 422,
  misconfigured: 500,
};

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse("invalid_topic", "Send a JSON body like {\"topic\": \"...\"}.", 400);
  }

  const parsed = GenerateRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("invalid_topic", parsed.error.issues[0]?.message ?? "Invalid topic.", 400);
  }
  const { topic } = parsed.data;

  // Cached lists are free, so they don't count against the limit.
  const cached = getCachedList(topic);
  if (cached) return NextResponse.json({ list: cached });

  const limit = limiter.check(clientKey(request));
  if (!limit.allowed) {
    return errorResponse(
      "rate_limited",
      `Whoa, slow down! You can make another list in ${limit.retryAfterSec} seconds.`,
      429,
      { "Retry-After": String(limit.retryAfterSec) },
    );
  }

  try {
    const list = await getTopList(topic);
    return NextResponse.json({ list });
  } catch (err) {
    if (err instanceof GenerationError) {
      return errorResponse(err.code, err.message, STATUS[err.code]);
    }
    console.error("[generate] unexpected error:", err);
    return errorResponse("internal", "Something unexpected went wrong. Please try again.", 500);
  }
}
