import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { RawTopListSchema } from "@/lib/schema";
import { config } from "../env";
import { GenerationError, type ClaudeBackend } from "./types";

/** Calls the Anthropic API with ANTHROPIC_API_KEY. */
let client: Anthropic | null = null;

export const apiBackend: ClaudeBackend = {
  name: "api",
  async call({ system, user }) {
    client ??= new Anthropic({ apiKey: config.anthropicApiKey, maxRetries: 2, timeout: 90_000 });
    try {
      const response = await client.beta.messages.parse({
        model: config.claudeModel,
        max_tokens: 16000,
        system,
        messages: [{ role: "user", content: user }],
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
        throw new GenerationError("refused", "That topic couldn't be turned into a list. Try a different one!");
      }
      if (response.stop_reason === "max_tokens") {
        return { ok: false, problem: "the answer was cut off; keep every field concise" };
      }
      if (!response.parsed_output) {
        return { ok: false, problem: "the answer was not valid JSON in the requested shape" };
      }
      return { ok: true, data: response.parsed_output };
    } catch (err) {
      if (err instanceof GenerationError) throw err;
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        console.error("[claude:api] auth error:", err.message);
        throw new GenerationError("misconfigured", "The server's Anthropic API key was rejected.");
      }
      if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
        console.error("[claude:api] busy:", err.status, err.message);
        throw new GenerationError("upstream_busy", "Claude is very busy right now. Try again in a minute.");
      }
      if (err instanceof Anthropic.APIConnectionError) {
        console.error("[claude:api] connection error:", err.message);
        throw new GenerationError("upstream_busy", "Couldn't reach Claude. Check your connection and try again.");
      }
      if (err instanceof Anthropic.APIError) {
        console.error("[claude:api] API error:", err.status, err.message);
        throw new GenerationError("generation_failed", "Something went wrong while writing your list.");
      }
      // The SDK throws if the JSON can't be parsed; treat that as a bad answer and retry.
      console.warn("[claude:api] unparseable answer:", (err as Error).message);
      return { ok: false, problem: "the answer was not valid JSON in the requested shape" };
    }
  },
};
