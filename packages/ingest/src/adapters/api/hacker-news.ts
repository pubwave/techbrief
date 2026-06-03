import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import { createArticleId, isFresh, sortByPublishedDate } from "../shared/article-utils.js";
import type { ApiSourceRule } from "./types.js";
import { normalizePublishedAt } from "../shared/date-utils.js";
import { sourceFetchSignal } from "../shared/fetch-timeout.js";

interface AlgoliaHit {
  objectID?: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  author?: string;
  created_at?: string;
  _tags?: string[];
  story_text?: string | null;
}

interface AlgoliaResponse {
  hits?: AlgoliaHit[];
}

function mapHitToArticle(source: SourceDefinition, hit: AlgoliaHit, rule: ApiSourceRule): FeedArticle | null {
  const title = hit.title?.trim() || hit.story_title?.trim();
  const sourceUrl = buildHackerNewsItemUrl(hit);
  const originalUrl = hit.url?.trim() || hit.story_url?.trim() || sourceUrl;
  const publishedAt = normalizePublishedAt(hit.created_at);

  if (!title || !originalUrl || !publishedAt) {
    return null;
  }

  return {
    id: createArticleId(source, originalUrl),
    sourceId: source.id,
    sourceName: source.name,
    contentType: source.category,
    declaredContentType: source.category,
    title,
    publishedAt,
    originalUrl,
    ...(sourceUrl && sourceUrl !== originalUrl ? { sourceUrl } : {}),
    tags: hit._tags ?? source.tags,
    language: "en",
    ...(hit.author ? { author: hit.author } : {}),
    ...(hit.story_text ? { bodyRaw: hit.story_text } : {}),
    ...(rule.sourceNote ? { summary: rule.sourceNote } : {})
  };
}

function buildHackerNewsItemUrl(hit: AlgoliaHit): string | undefined {
  const objectId = hit.objectID?.trim();
  return objectId ? `https://news.ycombinator.com/item?id=${encodeURIComponent(objectId)}` : undefined;
}

export async function fetchHackerNewsArticles(
  source: SourceDefinition,
  freshnessDays: number,
  rule: ApiSourceRule
): Promise<FeedArticle[]> {
  const response = await fetch(rule.endpoint, {
    headers: {
      "user-agent": "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)",
      accept: "application/json"
    },
    signal: sourceFetchSignal()
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as AlgoliaResponse;
  return sortByPublishedDate(
    (payload.hits ?? [])
      .map((hit) => mapHitToArticle(source, hit, rule))
      .filter((item): item is FeedArticle => item !== null)
      .filter((item) => isFresh(item.publishedAt, freshnessDays))
  );
}
