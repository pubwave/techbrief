import { decodeHtmlEntities } from "./html-entities.js";

const BLOCK_NOISE_PATTERN =
  /<(script|style|noscript|iframe|aside|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi;

export function sanitizeHtml(input: string): string {
  return decodeCloudflareEmails(input)
    .replace(BLOCK_NOISE_PATTERN, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/** Decode a Cloudflare-obfuscated email: first hex byte is the XOR key. */
function decodeCfEmail(hex: string): string {
  const key = parseInt(hex.slice(0, 2), 16);
  let email = "";
  for (let i = 2; i < hex.length; i += 2) {
    email += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  }
  return email;
}

/**
 * Replace Cloudflare "Email Address Obfuscation" markup with the real address.
 * Cloudflare rewrites emails as `<a data-cfemail="HEX">[email protected]</a>` or a
 * link to `/cdn-cgi/l/email-protection#HEX`; without decoding, the body keeps a
 * useless "[email protected]" placeholder.
 */
function decodeCloudflareEmails(input: string): string {
  return input
    .replace(
      /<(\w+)\b[^>]*\bdata-cfemail="([0-9a-fA-F]+)"[^>]*>[\s\S]*?<\/\1>/gi,
      (_match, _tag, hex) => decodeCfEmail(hex)
    )
    .replace(
      /<\w+\b[^>]*\bdata-cfemail="([0-9a-fA-F]+)"[^>]*\/?>/gi,
      (_match, hex) => decodeCfEmail(hex)
    )
    .replace(
      /<a\b[^>]*href="[^"]*\/cdn-cgi\/l\/email-protection#([0-9a-fA-F]+)"[^>]*>[\s\S]*?<\/a>/gi,
      (_match, hex) => decodeCfEmail(hex)
    );
}

export function stripHtmlTags(input: string): string {
  const stripped = input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p\b[^>]*>/gi, "\n\n")
    .replace(/<\/(p|div|section|article|li|blockquote|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return decodeHtmlEntities(stripped);
}
