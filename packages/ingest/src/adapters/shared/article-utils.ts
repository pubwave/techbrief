import crypto from "node:crypto";
import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import { normalizeArticleUrl } from "@techbrief/feed-rules";

export function createArticleId(source: SourceDefinition, originalUrl: string): string {
  const stableUrl = normalizeArticleUrl(originalUrl) ?? originalUrl;
  return crypto.createHash("sha1").update(`${source.id}:${stableUrl}`).digest("hex");
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(timestampMs: number): number {
  return Math.floor(timestampMs / MS_PER_DAY) * MS_PER_DAY;
}

// Freshness is compared by calendar day, not a rolling 24h window. Many sources
// (e.g. Anthropic newsroom) only expose a date with no time, which normalizes to
// 00:00 UTC; a rolling window would then drop a "yesterday" article for most of
// today. Day-based comparison treats freshnessDays as a day tolerance, so a
// 1-day window keeps today and yesterday. Future-dated items stay fresh.
export function isFresh(publishedAt: string, freshnessDays: number): boolean {
  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) {
    return false;
  }
  const dayDiff = (startOfUtcDay(Date.now()) - startOfUtcDay(publishedTime)) / MS_PER_DAY;
  return dayDiff <= freshnessDays;
}

export function sortByPublishedDate(items: FeedArticle[]): FeedArticle[] {
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}
