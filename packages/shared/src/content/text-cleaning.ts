const HTML_TAG_PATTERN = /<[^>]+>/;
const HTML_ENTITY_PATTERN = /&(?:[a-z][a-z0-9]+|#\d+|#x[a-f0-9]+);/i;
const PRIORITY_TEXT_KEYS = ["text", "#text", "__cdata", "_", "$text"] as const;

export function sanitizeArticleText(value: unknown): string | undefined {
  const raw = extractTextValue(value);
  if (raw == null) {
    return undefined;
  }

  const normalized = normalizeWhitespace(raw.replace(/\u00a0/g, " "));
  if (!normalized) {
    return undefined;
  }

  if (!looksLikeHtml(normalized)) {
    return normalized;
  }

  const decoded = normalizeWhitespace(stripHtmlTags(decodeHtmlEntities(normalized)).replace(/\u00a0/g, " "));
  return decoded || undefined;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractTextValue(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const text = value
      .map((entry) => extractTextValue(entry, depth + 1))
      .filter((entry): entry is string => Boolean(entry))
      .join(" ");
    return text || undefined;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of PRIORITY_TEXT_KEYS) {
    const text = extractTextValue(record[key], depth + 1);
    if (text) {
      return text;
    }
  }

  const fallback = Object.values(record)
    .map((entry) => extractTextValue(entry, depth + 1))
    .filter((entry): entry is string => Boolean(entry))
    .join(" ");
  return fallback || undefined;
}

function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value) || HTML_ENTITY_PATTERN.test(value);
}

function stripHtmlTags(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|section|article|li|blockquote|h[1-6]|a)>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => decodeCodePoint(Number.parseInt(code, 10)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code: string) => decodeCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&(apos|#39);/gi, "'");
}

function decodeCodePoint(codePoint: number): string {
  return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : "";
}
