export function decodeHtmlEntities(value: string): string {
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
  if (!Number.isFinite(codePoint)) {
    return "";
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return "";
  }
}
