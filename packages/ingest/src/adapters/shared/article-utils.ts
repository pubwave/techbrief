import crypto from "node:crypto";
import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import { normalizeArticleUrl } from "@techbrief/feed-rules";

export function createArticleId(source: SourceDefinition, originalUrl: string): string {
  const stableUrl = normalizeArticleUrl(originalUrl) ?? originalUrl;
  return crypto.createHash("sha1").update(`${source.id}:${stableUrl}`).digest("hex");
}

export function isFresh(publishedAt: string, freshnessDays: number): boolean {
  const publishedTime = new Date(publishedAt).getTime();
  const cutoff = Date.now() - freshnessDays * 24 * 60 * 60 * 1000;
  return Number.isFinite(publishedTime) && publishedTime >= cutoff;
}

export function sortByPublishedDate(items: FeedArticle[]): FeedArticle[] {
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}
