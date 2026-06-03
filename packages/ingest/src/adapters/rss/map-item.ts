import { isArticleLinkAllowedForSource, sanitizeArticleText, type FeedArticle, type SourceDefinition } from "@techbrief/shared";
import type { ParsedFeedItem } from "./parser.js";
import { createArticleId } from "../shared/article-utils.js";
import { extractFeedItemBody } from "./content.js";
import { normalizePublishedAt } from "../shared/date-utils.js";

function normalizeLink(link: ParsedFeedItem["link"]): string | null {
  if (!link) {
    return null;
  }

  if (typeof link === "string") {
    return sanitizeArticleText(link) ?? null;
  }

  if (Array.isArray(link)) {
    const articleLink = link.find((entry) => !entry.rel || entry.rel === "alternate") ?? link[0];
    return sanitizeArticleText(articleLink?.href) ?? null;
  }

  return sanitizeArticleText(link.href) ?? null;
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
    .map((entry) => sanitizeArticleText(typeof entry === "string" ? entry : entry.term))
    .filter((entry): entry is string => entry !== null);
}

export function mapFeedItemToArticle(source: SourceDefinition, item: ParsedFeedItem): FeedArticle | null {
  const title = sanitizeArticleText(item.title);
  const originalUrl = normalizeLink(item.link);
  const publishedAt = normalizePublishedAt(item.pubDate ?? item.published ?? item.updated);

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
    publishedAt,
    originalUrl,
    tags: normalizeTags(item.category),
    language: "en"
  };

  const author = normalizeAuthor(item.author);
  if (author) {
    article.author = author;
  }

  const rawDescription = item.description ?? item.summary;
  const description = sanitizeArticleText(rawDescription);
  const body = extractFeedItemBody(item);

  if (body) {
    article.bodyRaw = body;
    // The description is a feed-provided summary only when it differs from the
    // body. Full-text feeds repeat the whole article in description; that is the
    // body, not a summary, so it is dropped and a summary is derived downstream.
    if (description && description !== sanitizeArticleText(body)) {
      article.summary = description;
    }
  } else if (rawDescription != null && description) {
    // No separate body field: the description is the article content itself.
    // Store it as the body and leave the summary to be derived downstream.
    article.bodyRaw = typeof rawDescription === "string" ? rawDescription : description;
  }

  return article;
}
