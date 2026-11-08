import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { RawTopListSchema, TopListSchema, type TopList } from "@/lib/schema";
import { TOP_LIST_SYSTEM_PROMPT, topListUserPrompt } from "@/lib/prompts/topList";
import { config } from "./env";

export class GenerationError extends Error {
  constructor(
    public readonly code: "generation_failed" | "upstream_busy" | "refused" | "misconfigured",
    message: string,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!config.anthropicApiKey) {
    throw new GenerationError(
      "misconfigured",
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the server.",
    );
  }
  client ??= new Anthropic({ apiKey: config.anthropicApiKey, maxRetries: 2, timeout: 90_000 });
  return client;
}

type Attempt = { ok: true; list: TopList } | { ok: false; problems: string[] };

async function attemptGeneration(topic: string, previousProblems?: string[]): Promise<Attempt> {
  const response = await getClient().beta.messages.parse({
    model: config.claudeModel,
    max_tokens: 16000,
    system: TOP_LIST_SYSTEM_PROMPT,
    messages: [{ role: "user", content: topListUserPrompt(topic, previousProblems) }],
    output_config: {
      effort: config.claudeEffort,
      format: betaZodOutputFormat(RawTopListSchema),
    },
    // If a safety classifier declines, let the API re-run the request on a
    // suitable fallback model instead of failing outright.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal") {
    throw new GenerationError(
      "refused",
      "That topic couldn't be turned into a list. Try a different one!",
    );
  }
  if (response.stop_reason === "max_tokens") {
    return { ok: false, problems: ["the answer was cut off; keep every field concise"] };
  }

  const raw = response.parsed_output;
  if (!raw) return { ok: false, problems: ["the answer was not valid JSON in the requested shape"] };

  const result = TopListSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      problems: result.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`),
    };
  }
  return { ok: true, list: result.data };
}

/**
 * Ask Claude for a Top 10 list, validate it, and retry once (telling Claude
 * what was wrong) if the first answer is unusable.
 */
export async function generateTopList(topic: string): Promise<TopList> {
  let problems: string[] | undefined;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await attemptGeneration(topic, problems);
      if (result.ok) {
        const items = [...result.list.items].sort((a, b) => b.rank - a.rank);
        return { ...result.list, items };
      }
      problems = result.problems;
      console.warn(`[claude] attempt ${attempt} invalid:`, problems.slice(0, 5));
    } catch (err) {
      if (err instanceof GenerationError) throw err;
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        console.error("[claude] auth error:", err.message);
        throw new GenerationError("misconfigured", "The server's Anthropic API key was rejected.");
      }
      if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
        console.error("[claude] busy:", err.status, err.message);
        throw new GenerationError("upstream_busy", "Claude is very busy right now. Try again in a minute.");
      }
      if (err instanceof Anthropic.APIConnectionError) {
        console.error("[claude] connection error:", err.message);
        throw new GenerationError("upstream_busy", "Couldn't reach Claude. Check your connection and try again.");
      }
      if (err instanceof Anthropic.APIError) {
        console.error("[claude] API error:", err.status, err.message);
        throw new GenerationError("generation_failed", "Something went wrong while writing your list.");
      }
      // The SDK throws if the JSON can't be parsed; treat that as a bad answer and retry.
      console.warn(`[claude] attempt ${attempt} threw:`, (err as Error).message);
      problems = ["the answer was not valid JSON in the requested shape"];
    }
  }
  throw new GenerationError(
    "generation_failed",
    "We couldn't put that list together this time. Try again, or tweak the topic.",
  );
}
