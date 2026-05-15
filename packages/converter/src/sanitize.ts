const BLOCK_NOISE_PATTERN =
  /<(script|style|noscript|iframe|aside|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi;

export function sanitizeHtml(input: string): string {
  return input.replace(BLOCK_NOISE_PATTERN, "").replace(/\r\n/g, "\n").trim();
}

export function stripHtmlTags(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|blockquote|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
