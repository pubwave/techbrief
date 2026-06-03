import type { FeedArticle } from "@techbrief/shared";

export interface TranslationOutputValidationInput {
  sourceArticle: FeedArticle;
  targetLanguage: string;
  translatedTitle?: string | null | undefined;
  translatedSummary?: string | null | undefined;
  translatedBodyMarkdown?: string | null | undefined;
}

export interface TranslationOutputValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTranslationOutputLanguage(
  input: TranslationOutputValidationInput
): TranslationOutputValidationResult {
  const expectedScript = getExpectedScript(input.targetLanguage);
  if (!expectedScript) {
    return { valid: true };
  }

  const bodyText = stripLowSignalText(input.translatedBodyMarkdown ?? "");
  if (looksUntranslated(bodyText, expectedScript.pattern, expectedScript.minimumBodyChars)) {
    return {
      valid: false,
      error: `Translation output did not match target language ${input.targetLanguage}.`
    };
  }

  const sourceTitleLatinChars = countMatches(input.sourceArticle.title, LATIN_LETTER_PATTERN);
  const translatedTitle = input.translatedTitle?.trim() ?? "";
  if (
    sourceTitleLatinChars >= 8 &&
    translatedTitle.length > 0 &&
    countMatches(translatedTitle, expectedScript.pattern) < expectedScript.minimumTitleChars
  ) {
    return {
      valid: false,
      error: `Translated title did not match target language ${input.targetLanguage}.`
    };
  }

  const combinedText = stripLowSignalText([
    input.translatedTitle,
    input.translatedSummary,
    input.translatedBodyMarkdown
  ].filter(Boolean).join("\n"));
  if (looksUntranslated(combinedText, expectedScript.pattern, expectedScript.minimumCombinedChars)) {
    return {
      valid: false,
      error: `Translation output did not match target language ${input.targetLanguage}.`
    };
  }

  return { valid: true };
}

const LATIN_LETTER_PATTERN = /[A-Za-z]/gu;

// Below this many Latin letters there isn't enough translatable prose to decide
// whether output is in the target language (code-heavy or very short articles),
// so such output is never rejected on a target-script character count.
const MIN_LATIN_PROSE_TO_JUDGE = 24;

/**
 * Output looks untranslated only when it has too few target-script characters
 * AND still contains substantial Latin prose that should have been translated.
 * Code-heavy or very short bodies carry too little prose to judge and pass.
 */
function looksUntranslated(text: string, scriptPattern: RegExp, minimumScriptChars: number): boolean {
  if (text.trim().length === 0) {
    return false;
  }

  if (countMatches(text, scriptPattern) >= minimumScriptChars) {
    return false;
  }

  return countMatches(text, LATIN_LETTER_PATTERN) >= MIN_LATIN_PROSE_TO_JUDGE;
}

interface ExpectedScript {
  pattern: RegExp;
  minimumTitleChars: number;
  minimumBodyChars: number;
  minimumCombinedChars: number;
}

function getExpectedScript(targetLanguage: string): ExpectedScript | null {
  const normalizedLanguage = targetLanguage.toLowerCase();
  if (normalizedLanguage.startsWith("zh")) {
    return {
      pattern: /\p{Script=Han}/gu,
      minimumTitleChars: 2,
      minimumBodyChars: 12,
      minimumCombinedChars: 16
    };
  }
  if (normalizedLanguage.startsWith("ja")) {
    return {
      pattern: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu,
      minimumTitleChars: 2,
      minimumBodyChars: 12,
      minimumCombinedChars: 16
    };
  }
  if (normalizedLanguage.startsWith("ko")) {
    return {
      pattern: /\p{Script=Hangul}/gu,
      minimumTitleChars: 2,
      minimumBodyChars: 12,
      minimumCombinedChars: 16
    };
  }

  return null;
}

function stripLowSignalText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches?.length ?? 0;
}
