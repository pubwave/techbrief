export function isTranslationComplete(
  sourceBody: string,
  translatedBody: string,
  targetLanguage: string
): boolean {
  const sourceLength = normalizeLength(sourceBody);
  const translatedLength = normalizeLength(translatedBody);
  if (translatedLength === 0) {
    return false;
  }

  const ratio = minLengthRatio(targetLanguage);

  if (sourceLength < 600) {
    return translatedLength >= Math.max(80, Math.floor(sourceLength * ratio * 0.9));
  }

  const sourceParagraphs = countParagraphs(sourceBody);
  const translatedParagraphs = countParagraphs(translatedBody);
  const minParagraphs = Math.max(2, Math.floor(sourceParagraphs * 0.35));
  const minLength = Math.max(500, Math.floor(sourceLength * ratio));

  return translatedLength >= minLength
    && translatedParagraphs >= minParagraphs
    && hasCompleteEnding(translatedBody);
}

// Minimum translated-to-source length ratio, tuned per target-language density.
// CJK languages are denser (fewer characters per idea) than English, so valid
// translations are naturally shorter.
function minLengthRatio(targetLanguage: string): number {
  const lang = targetLanguage.toLowerCase();
  if (lang.startsWith("zh")) {
    return 0.12;
  }

  if (lang.startsWith("ja") || lang.startsWith("ko")) {
    return 0.16;
  }

  if (lang.startsWith("th") || lang.startsWith("vi")) {
    return 0.18;
  }

  return 0.22;
}

function normalizeLength(input: string): number {
  return input.replace(/\s+/g, " ").trim().length;
}

function countParagraphs(input: string): number {
  return input
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .length;
}

function hasCompleteEnding(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) {
    return false;
  }

  return !/[,:;([{"'`\u201c\u2018-]$/.test(trimmed);
}
