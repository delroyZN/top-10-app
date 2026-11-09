import "server-only";

export class GenerationError extends Error {
  constructor(
    public readonly code: "generation_failed" | "upstream_busy" | "refused" | "misconfigured",
    message: string,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

export interface ModelRequest {
  system: string;
  user: string;
}

/**
 * One call to Claude. Returns the parsed JSON object, or a short description
 * of why the answer was unusable (so the caller can retry with feedback).
 * Throws `GenerationError` for problems a retry won't fix.
 */
export type ModelResult = { ok: true; data: unknown } | { ok: false; problem: string };

export interface ClaudeBackend {
  name: "api" | "cli";
  call(req: ModelRequest): Promise<ModelResult>;
}
