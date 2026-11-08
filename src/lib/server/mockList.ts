import "server-only";
import type { TopList } from "@/lib/schema";

/**
 * Fixed sample list used when MOCK_GENERATION=1, so the UI can be worked on
 * without an Anthropic API key (and without spending tokens).
 */
export function mockTopList(topic: string): TopList {
  const names = [
    ["Hippopotamus", "Hippopotamus"],
    ["Cape buffalo", "African buffalo"],
    ["Nile crocodile", "Nile crocodile"],
    ["Black mamba", "Black mamba"],
    ["Lion", "Lion"],
    ["African elephant", "African bush elephant"],
    ["Puff adder", "Puff adder"],
    ["Tsetse fly", "Tsetse fly"],
    ["Freshwater snail", "Schistosomiasis"],
    ["Mosquito", "Mosquito"],
  ];
  return {
    title: `Top 10: ${topic}`,
    intro: "This is sample data (MOCK_GENERATION=1). Turn mock mode off to generate real lists with Claude.",
    items: names.map(([name, wikipediaTitle], i) => ({
      rank: 10 - i,
      name,
      blurb: `${name} sits at number ${10 - i} on this sample list. This placeholder text shows how a two to three sentence blurb looks on screen.`,
      didYouKnow: `This is a sample "did you know" fact for ${name}.`,
      imageQuery: name,
      wikipediaTitle,
    })),
  };
}
