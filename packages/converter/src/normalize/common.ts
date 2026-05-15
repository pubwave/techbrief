export function normalizeWhitespace(text: string): string {
  return text.replace(/\t/g, "  ").replace(/[ \u00A0]+/g, " ").trim();
}

export function splitParagraphs(text: string): string[] {
  return text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
