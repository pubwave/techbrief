// Minimal English stopword list. CJK has no equivalent flat list, so single
// CJK characters are kept as tokens (each character contributes to similarity).
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "else", "of", "to", "in",
  "on", "at", "by", "for", "with", "as", "is", "are", "was", "were", "be", "been",
  "being", "it", "its", "this", "that", "these", "those", "from", "into", "over",
  "after", "before", "than", "so", "such", "no", "not", "can", "will", "would",
  "should", "could", "may", "might", "do", "does", "did", "has", "have", "had",
  "we", "you", "they", "he", "she", "i", "their", "our", "your", "his", "her",
  "them", "us", "about", "up", "out", "off", "all", "any", "more", "most", "some"
]);

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Private-use placeholder standing in for a non-terminal period while splitting,
// so abbreviation dots ("p.m.", "F.", "Inc.") don't trigger a sentence break.
const DOT = String.fromCharCode(0xe000);

const ABBREVIATIONS = [
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "mt", "gen", "gov", "sen",
  "rep", "inc", "ltd", "llp", "llc", "co", "corp", "plc", "vs", "etc", "al",
  "approx", "dept", "est", "fig", "no", "vol", "jan", "feb", "mar", "apr", "jun",
  "jul", "aug", "sep", "sept", "oct", "nov", "dec", "mon", "tue", "wed", "thu",
  "fri", "sat", "sun"
];
const ABBREVIATION_PATTERN = new RegExp(`\\b(${ABBREVIATIONS.join("|")})\\.`, "gi");

/** Mask periods that do not end a sentence so the split below ignores them. */
function maskAbbreviationPeriods(text: string): string {
  return text
    // Dotted acronyms / units: U.S., a.m., p.m., e.g., i.e. (mask every dot).
    .replace(/\b(?:[A-Za-z]\.){2,}/g, (match) => match.split(".").join(DOT))
    // Single-letter initials: "Jonathan F. Lenzner".
    .replace(/\b([A-Za-z])\./g, `$1${DOT}`)
    // Common abbreviations: Mr. Inc. LLP. etc.
    .replace(ABBREVIATION_PATTERN, `$1${DOT}`)
    // Decimals: 3.5, $1.2M.
    .replace(/(\d)\.(?=\d)/g, `$1${DOT}`);
}

/**
 * Split text into sentences. Breaks after CJK terminators (。！？) which need no
 * trailing whitespace, and after Latin terminators (. ! ?) when followed by
 * whitespace. Uses zero-width lookbehind so terminators stay attached.
 * Abbreviation and decimal periods are masked first so they don't split.
 */
export function splitSentences(text: string): string[] {
  return maskAbbreviationPeriods(text)
    .split(/(?<=[。！？])|(?<=[.!?]["'”’）)\]]*)\s+/)
    .map((sentence) => sentence.split(DOT).join(".").trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * Tokenize a sentence for similarity scoring: lowercased Latin words plus
 * individual CJK characters, with English stopwords and lone Latin characters
 * dropped.
 */
export function tokenize(sentence: string): string[] {
  const tokens: string[] = [];
  for (const match of sentence.toLowerCase().matchAll(/[a-z0-9]+|[一-鿿]/g)) {
    const token = match[0];
    if (!token) {
      continue;
    }
    if (token.length === 1 && /[a-z0-9]/.test(token)) {
      continue;
    }
    if (STOPWORDS.has(token)) {
      continue;
    }
    tokens.push(token);
  }
  return tokens;
}
