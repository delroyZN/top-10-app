import "server-only";
import { TopListSchema, type TopList } from "@/lib/schema";
import { TOP_LIST_SYSTEM_PROMPT, topListUserPrompt } from "@/lib/prompts/topList";
import { config } from "../env";
import { apiBackend } from "./apiBackend";
import { cliBackend } from "./cliBackend";
import { GenerationError, type ClaudeBackend } from "./types";

export { GenerationError };

/**
 * Which way we talk to Claude:
 *   CLAUDE_MODE=api  → Anthropic API (needs ANTHROPIC_API_KEY)
 *   CLAUDE_MODE=cli  → local Claude Code CLI (uses your Claude subscription)
 *   unset            → API if a key is set, otherwise the local CLI
 */
export function getBackend(): ClaudeBackend {
  if (config.claudeMode === "api" || (config.claudeMode !== "cli" && config.anthropicApiKey)) {
    if (!config.anthropicApiKey) {
      throw new GenerationError("misconfigured", "CLAUDE_MODE=api but ANTHROPIC_API_KEY is not set in .env.local.");
    }
    return apiBackend;
  }
  return cliBackend;
}

/**
 * Ask Claude for a Top 10 list, validate it, and retry once (telling Claude
 * what was wrong) if the first answer is unusable.
 */
export async function generateTopList(topic: string): Promise<TopList> {
  const backend = getBackend();
  let problems: string[] | undefined;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await backend.call({
      system: TOP_LIST_SYSTEM_PROMPT,
      user: topListUserPrompt(topic, problems),
    });

    if (result.ok) {
      const valid = TopListSchema.safeParse(result.data);
      if (valid.success) {
        const items = [...valid.data.items].sort((a, b) => b.rank - a.rank);
        return { ...valid.data, items };
      }
      problems = valid.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`);
    } else {
      problems = [result.problem];
    }
    console.warn(`[claude:${backend.name}] attempt ${attempt} invalid:`, problems.slice(0, 5));
  }

  throw new GenerationError(
    "generation_failed",
    "We couldn't put that list together this time. Try again, or tweak the topic.",
  );
}
