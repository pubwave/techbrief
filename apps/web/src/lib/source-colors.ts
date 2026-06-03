const SOURCE_COLORS: Record<string, string> = {
  "Anthropic Newsroom": "#7c6af5",
  Anthropic: "#7c6af5",
  "Vercel Blog": "#e0e0e0",
  Vercel: "#e0e0e0",
  "GitHub Blog": "#6bab6b",
  GitHub: "#6bab6b",
  "The Verge": "#e85d4a",
  "Hacker News": "#f06a1b",
  "OpenAI Blog": "#5bb0ed",
  OpenAI: "#5bb0ed",
  "CSS Tricks": "#f0b429",
};

const FALLBACK_PALETTE = [
  "#4d9cf6",
  "#7c6af5",
  "#6bab6b",
  "#e85d4a",
  "#f06a1b",
  "#5bb0ed",
  "#f0b429",
  "#35d6ff",
];

export function getSourceColor(source: string): string {
  const hit = SOURCE_COLORS[source];
  if (hit) {
    return hit;
  }
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length] as string;
}
