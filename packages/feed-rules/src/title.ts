export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function createTitleFingerprint(input: string): string {
  return normalizeWhitespace(input)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isBlockedWeakSourceTitle(input: string): boolean {
  const normalized = createTitleFingerprint(input);
  if (normalized.length === 0) {
    return true;
  }

  if (/^(terms( of use)?|privacy( policy)?|sign in|login|search|forums|bookmarks)$/.test(normalized)) {
    return true;
  }

  if (/^[a-z0-9-]+\.(dev|com|net|org|io)$/.test(normalized)) {
    return true;
  }

  return normalized.length < 8;
}
