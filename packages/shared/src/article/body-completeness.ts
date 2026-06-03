import { sanitizeArticleText } from "../content/text-cleaning.js";
import type { FeedArticle } from "./types.js";

const MIN_COMPLETE_BODY_TEXT_LENGTH = 800;
const MIN_COMPLETE_BODY_PARAGRAPHS = 3;
const DETAIL_REPLACEMENT_RATIO = 1.25;
const DETAIL_REPLACEMENT_MIN_GAIN = 400;

export interface ArticleBodyCompleteness {
  textLength: number;
  paragraphCount: number;
}

export function hasCompleteArticleBody(article: FeedArticle): boolean {
  const body = article.bodyRaw ?? article.bodyNormalized;
  if (!body?.trim()) {
    return false;
  }

  const completeness = measureArticleBodyCompleteness(body);
  return completeness.textLength >= MIN_COMPLETE_BODY_TEXT_LENGTH
    && completeness.paragraphCount >= MIN_COMPLETE_BODY_PARAGRAPHS;
}

export function articleNeedsBodyHydration(article: FeedArticle): boolean {
  return !hasCompleteArticleBody(article);
}

export function shouldReplaceArticleBody(current: FeedArticle, candidateBody: string): boolean {
  const currentBody = current.bodyRaw ?? current.bodyNormalized ?? "";
  if (!currentBody.trim()) {
    return true;
  }

  const currentCompleteness = measureArticleBodyCompleteness(currentBody);
  const candidateCompleteness = measureArticleBodyCompleteness(candidateBody);
  const lengthGain = candidateCompleteness.textLength - currentCompleteness.textLength;

  return lengthGain >= DETAIL_REPLACEMENT_MIN_GAIN
    || candidateCompleteness.textLength >= currentCompleteness.textLength * DETAIL_REPLACEMENT_RATIO;
}

function measureArticleBodyCompleteness(body: string): ArticleBodyCompleteness {
  const text = sanitizeArticleText(body) ?? "";
  return {
    textLength: text.length,
    paragraphCount: countParagraphs(body, text)
  };
}

function countParagraphs(body: string, text: string): number {
  const htmlParagraphs = body.match(/<(p|h[1-6]|li|blockquote)\b/gi)?.length ?? 0;
  if (htmlParagraphs > 0) {
    return htmlParagraphs;
  }

  const markdownParagraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;
  if (markdownParagraphs > 0) {
    return markdownParagraphs;
  }

  return text ? 1 : 0;
}
