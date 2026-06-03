// Language-aware reading-time estimate. CJK scripts have no word spacing, so a
// whitespace word count collapses them to near zero; they are counted by
// character instead (~400 chars/min), while Latin text is counted by word
// (~220 words/min). Mixed content sums both.
const CJK_PATTERN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;

const CJK_CHARS_PER_MINUTE = 400;
const LATIN_WORDS_PER_MINUTE = 220;

export function estimateReadMinutes(text: string): number {
  const cjkChars = text.match(CJK_PATTERN)?.length ?? 0;
  const latinWords = text
    .replace(CJK_PATTERN, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = cjkChars / CJK_CHARS_PER_MINUTE + latinWords / LATIN_WORDS_PER_MINUTE;
  return Math.max(1, Math.round(minutes));
}
