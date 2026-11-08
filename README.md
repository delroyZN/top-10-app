# Top10

Generate dramatic **Top 10 countdowns** with fun facts, images and sources, on any topic.

Built with Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion and the Claude API.
Images come from Wikimedia Commons (with Unsplash as a fallback), and source links come from Wikipedia.

## Run it locally

You need **Node.js 20.9 or newer**.

```bash
git clone https://github.com/delroyZN/top-10-app.git
cd top-10-app
npm install
cp .env.example .env.local     # on Windows: copy .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Required | Where to get it |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | https://console.anthropic.com/settings/keys |
| `UNSPLASH_ACCESS_KEY` | recommended | Create an app at https://unsplash.com/oauth/applications and copy its **Access Key** |

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

Without an Unsplash key the app still works. Items that don't have a Wikimedia image get a styled placeholder instead.
To try the UI without any API key, set `MOCK_GENERATION=1` in `.env.local` to use a built-in sample list.

### Optional settings (`.env.local`)

| Variable | Default | What it does |
| --- | --- | --- |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Model used to write the lists |
| `CLAUDE_EFFORT` | `low` | `low`, `medium` or `high`. Higher is slower but more careful |
| `RATE_LIMIT_PER_MINUTE` | `5` | New lists per IP per minute |
| `RATE_LIMIT_PER_HOUR` | `30` | New lists per IP per hour |
| `MOCK_GENERATION` | off | `1` returns a sample list instead of calling Claude |

## How it works

1. The home page sends you to `/list?topic=…`, which calls `POST /api/generate`.
2. The route validates the topic, checks the per-IP rate limit, and asks Claude for a strict JSON list
   (structured outputs). The answer is checked with zod: exactly 10 items, ranks 1–10, no empty fields.
   If it fails, the route retries once and tells Claude what was wrong. If that also fails, you get a friendly error.
3. Each `wikipediaTitle` is checked against Wikipedia in one batched request. Titles that don't exist, or that
   point to disambiguation pages, are dropped, so made-up titles never become source links.
4. Image chain per item: the article's free lead image on Wikimedia Commons, then a Commons search, then
   Unsplash (Unsplash comes first for abstract items), then a styled placeholder. Author and licence are
   shown under every image.
5. Finished lists are cached in memory for 30 minutes, so a reload doesn't cost another Claude call.

API keys are only read in server-only modules (`src/lib/server/*`, `src/lib/images/*`) and never reach the browser.

## Project layout

```
src/
  app/
    page.tsx                 Home: topic input + example topics
    list/page.tsx            Results page (countdown / show all)
    api/generate/route.ts    The only API route: validate → rate limit → generate → enrich
  components/
    home/                    TopicForm, ExampleTopics, HeroNumbers
    countdown/               Countdown, CountdownItem, NumberOneReveal, ShowAllList, ItemImage, …
    loading/                 LoadingScreen with rotating messages
    ui/                      Button, Logo, ErrorState
  hooks/                     useTopList, useCountdown, useKeyboardNav
  lib/
    schema.ts                Shared zod schemas + types (client-safe)
    content.ts               Example topics, loading messages
    prompts/                 System/user prompts per content mode
    images/                  wikimedia.ts, unsplash.ts, resolveImage.ts (fallback chain)
    server/                  claude.ts, wikipedia.ts, enrich.ts, rateLimit.ts, cache.ts, env.ts
    client/                  Browser-side API wrapper
```

### Where later phases plug in

- **"Did you know" cards / Fact of the day**: add a prompt in `lib/prompts/` and a schema in `lib/schema.ts`,
  then reuse `resolveImage` and `lookupWikipediaPages` for images and sources.
- **Quiz mode**: `useCountdown` takes a `canAdvance` callback to hold the reveal until the player guesses.
- **Share as image**: `CountdownItem` and `ItemImage` are self-contained and can be rendered into a share card.
- **Accounts, favourites, saved lists (Supabase)**: `EnrichedTopList` is the saved shape. The rate limiter and
  cache sit behind small interfaces so they can move to a shared store.

## Notes

- Lists are written by AI. The prompt tells Claude to include only facts it is confident about and to avoid
  made-up statistics, but mistakes are still possible, which is why each item links to its source.
- The in-memory rate limiter and cache are per server process. That's fine locally and on a single server.
  Swap them for Redis/Supabase before deploying to serverless.
