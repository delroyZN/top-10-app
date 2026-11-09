/**
 * Static copy used across the UI. Kept in one place so later features
 * (categories page, "Surprise me") can reuse the same topic lists.
 */

export const EXAMPLE_TOPICS = [
  "deadliest animals in Africa",
  "strangest laws in the world",
  "biggest inventions of the 1900s",
  "most iconic football goals",
  "weirdest deep sea creatures",
  "tallest buildings ever built",
];

export const LOADING_MESSAGES = [
  "Warming up the countdown clock…",
  "Interviewing the contestants…",
  "Arguing about who deserves #1…",
  "Fact-checking with a very strict librarian…",
  "Hunting down the perfect photos…",
  "Rehearsing the dramatic pause…",
  "Polishing the trophy for #1…",
  "Cutting the boring facts…",
  "Cueing the drumroll…",
  "Almost there, adjusting the spotlight…",
];

export function listHref(topic: string) {
  return `/list?topic=${encodeURIComponent(topic.trim())}`;
}
