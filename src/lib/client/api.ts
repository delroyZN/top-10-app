import type { EnrichedTopList, GenerateErrorCode, GenerateResponse } from "@/lib/schema";

export class ApiError extends Error {
  constructor(
    public readonly code: GenerateErrorCode | "network",
    message: string,
  ) {
    super(message);
  }
}

/** Call our own server route. The browser never talks to Claude directly. */
export async function requestTopList(topic: string): Promise<EnrichedTopList> {
  let res: Response;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
  } catch {
    throw new ApiError("network", "Couldn't reach the server. Check your connection and try again.");
  }

  let body: GenerateResponse | null = null;
  try {
    body = (await res.json()) as GenerateResponse;
  } catch {
    // fall through to the generic error below
  }

  if (body && "list" in body) return body.list;
  if (body && "error" in body) throw new ApiError(body.error.code, body.error.message);
  throw new ApiError("internal", "Something unexpected went wrong. Please try again.");
}
