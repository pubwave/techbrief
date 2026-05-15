import type { FeedArticle } from "./types.js";

function normalizeText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getArticleSourceBody(article: FeedArticle): string | undefined {
  return normalizeText(article.bodyRaw) ?? normalizeText(article.bodyNormalized);
}

export function hasArticleSourceBody(article: FeedArticle): boolean {
  return Boolean(getArticleSourceBody(article));
}

export function getArticlePromptBody(article: FeedArticle): string {
  return getArticleSourceBody(article)
    ?? normalizeText(article.summary)
    ?? normalizeText(article.title)
    ?? "";
}
