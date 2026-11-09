import "server-only";
import spawn from "cross-spawn";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { RawTopListSchema } from "@/lib/schema";
import { config } from "../env";
import { GenerationError, type ClaudeBackend } from "./types";

/**
 * Local mode: runs the Claude Code CLI installed on this computer
 * (`claude -p`), so lists are written with your Claude subscription and no
 * API key is needed. Only works where the Next.js server runs on a machine
 * that has Claude Code installed and signed in (i.e. `npm run dev` locally).
 */

const TIMEOUT_MS = 180_000;
// Drop "$schema": the CLI's validator doesn't load the 2020-12 meta-schema.
const schemaBody: Record<string, unknown> = { ...z.toJSONSchema(RawTopListSchema) };
delete schemaBody.$schema;
const JSON_SCHEMA = JSON.stringify(schemaBody);

// Long multi-line prompts don't survive Windows command-line quoting well,
// so the system prompt goes in a temp file (--system-prompt-file).
const promptFiles = new Map<string, string>();
function systemPromptFile(system: string): string {
  let file = promptFiles.get(system);
  if (!file) {
    const dir = mkdtempSync(path.join(os.tmpdir(), "top10-"));
    file = path.join(dir, "system-prompt.txt");
    writeFileSync(file, system, "utf8");
    promptFiles.set(system, file);
  }
  return file;
}

interface CliResult {
  type?: string;
  subtype?: string;
  is_error?: boolean;
  result?: string;
  structured_output?: unknown;
  api_error_status?: number | null;
}

function run(args: string[], stdin: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // cross-spawn handles Windows .cmd/.exe shims and argument quoting.
    const child = spawn(config.claudeCliPath, args, {
      // Run outside the project so no CLAUDE.md / project settings are picked up.
      cwd: os.tmpdir(),
      env: { ...process.env, ANTHROPIC_API_KEY: "" },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill(), TIMEOUT_MS);
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin?.end(stdin);
  });
}

function cliError(text: string): GenerationError {
  const t = text.toLowerCase();
  if (/(not logged in|log ?in|authenticat|invalid api key|\/login)/.test(t)) {
    return new GenerationError(
      "misconfigured",
      "Claude Code isn't signed in on this computer. Run `claude` in a terminal, sign in, then try again.",
    );
  }
  if (/(usage limit|rate limit|overloaded|429|529)/.test(t)) {
    return new GenerationError("upstream_busy", "Claude is busy or your usage limit was reached. Try again a bit later.");
  }
  return new GenerationError("generation_failed", "Something went wrong while writing your list.");
}

export const cliBackend: ClaudeBackend = {
  name: "cli",
  async call({ system, user }) {
    const args = [
      "-p",
      "--output-format",
      "json",
      "--json-schema",
      JSON_SCHEMA,
      "--system-prompt-file",
      systemPromptFile(system),
      "--tools",
      "",
      "--no-session-persistence",
      "--effort",
      config.claudeEffort,
    ];
    if (config.claudeCliModel) args.push("--model", config.claudeCliModel);

    let out: Awaited<ReturnType<typeof run>>;
    try {
      out = await run(args, user);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      console.error("[claude:cli] failed to start:", (err as Error).message);
      if (code === "ENOENT") {
        throw new GenerationError(
          "misconfigured",
          "Couldn't find the Claude Code CLI. Install it (https://claude.com/claude-code), or set CLAUDE_CLI_PATH in .env.local.",
        );
      }
      throw new GenerationError("generation_failed", "Couldn't start Claude Code on this computer.");
    }

    let parsed: CliResult | null = null;
    try {
      parsed = JSON.parse(out.stdout) as CliResult;
    } catch {
      // not JSON: handled below
    }

    if (!parsed) {
      console.error(`[claude:cli] exit ${out.code}; stderr: ${out.stderr.slice(0, 500)}; stdout: ${out.stdout.slice(0, 500)}`);
      if (out.code === null) {
        throw new GenerationError("upstream_busy", "Claude took too long to answer. Try again.");
      }
      throw cliError(out.stderr + out.stdout);
    }

    if (parsed.is_error || parsed.subtype !== "success") {
      console.error(`[claude:cli] error result (${parsed.subtype}):`, String(parsed.result).slice(0, 500));
      throw cliError(`${parsed.result ?? ""} ${parsed.api_error_status ?? ""} ${out.stderr}`);
    }

    if (parsed.structured_output && typeof parsed.structured_output === "object") {
      return { ok: true, data: parsed.structured_output };
    }
    // Fall back to parsing the text result in case structured output was skipped.
    try {
      return { ok: true, data: JSON.parse(parsed.result ?? "") };
    } catch {
      return { ok: false, problem: "the answer was not valid JSON in the requested shape" };
    }
  },
};
