import { isArticleLinkAllowedForSource, sanitizeArticleText, type FeedArticle, type SourceDefinition } from "@techbrief/shared";
import type { ParsedFeedItem } from "./parser.js";
import { createArticleId } from "../shared/article-utils.js";

function normalizeLink(link: ParsedFeedItem["link"]): string | null {
  if (!link) {
    return null;
  }

  return sanitizeArticleText(typeof link === "string" ? link : link.href) ?? null;
}

function normalizeAuthor(author: ParsedFeedItem["author"]): string | undefined {
  if (!author) {
    return undefined;
  }

  return sanitizeArticleText(typeof author === "string" ? author : author.name) ?? undefined;
}

function normalizeTags(category: ParsedFeedItem["category"]): string[] {
  if (!category) {
    return [];
  }

  return (Array.isArray(category) ? category : [category])
    .map((entry) => sanitizeArticleText(entry))
    .filter((entry): entry is string => entry !== null);
}

export function mapFeedItemToArticle(source: SourceDefinition, item: ParsedFeedItem): FeedArticle | null {
  const title = sanitizeArticleText(item.title);
  const originalUrl = normalizeLink(item.link);
  const publishedAt = item.pubDate ?? item.published ?? item.updated;

  if (!title || !originalUrl || !publishedAt) {
    return null;
  }

  if (!isArticleLinkAllowedForSource(source, originalUrl)) {
    return null;
  }

  const article: FeedArticle = {
    id: createArticleId(source, originalUrl),
    sourceId: source.id,
    sourceName: source.name,
    contentType: source.category,
    declaredContentType: source.category,
    title,
    publishedAt: new Date(publishedAt).toISOString(),
    originalUrl,
    tags: normalizeTags(item.category),
    language: "en"
  };

  const author = normalizeAuthor(item.author);
  if (author) {
    article.author = author;
  }

  const summary = item.description ?? item.summary;
  const normalizedSummary = sanitizeArticleText(summary);
  if (normalizedSummary) {
    article.summary = normalizedSummary;
  }

  return article;
}
