import { sanitizeArticleText, type FeedArticle, type SourceDefinition } from "@techbrief/shared";
import { createArticleId, isFresh, sortByPublishedDate } from "../shared/article-utils.js";
import type { ApiSourceRule } from "./types.js";

interface DevToArticle {
  id?: number;
  title?: string;
  description?: string;
  cover_image?: string | null;
  published_at?: string;
  published_timestamp?: string;
  url?: string;
  canonical_url?: string;
  tag_list?: string[] | string;
  body_markdown?: string;
  user?: {
    name?: string;
    username?: string;
  };
}

function normalizeTagList(tagList: DevToArticle["tag_list"]): string[] {
  if (Array.isArray(tagList)) {
    return tagList;
  }

  if (typeof tagList === "string") {
    return tagList
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapDevToArticle(source: SourceDefinition, item: DevToArticle): FeedArticle | null {
  const title = sanitizeArticleText(item.title);
  const originalUrl = sanitizeArticleText(item.canonical_url) ?? sanitizeArticleText(item.url);
  const summary = sanitizeArticleText(item.description);
  const author = sanitizeArticleText(item.user?.name);
  const publishedAtRaw = item.published_at ?? item.published_timestamp;

  if (!title || !originalUrl || !publishedAtRaw) {
    return null;
  }

  return {
    id: createArticleId(source, originalUrl),
    sourceId: source.id,
    sourceName: source.name,
    contentType: source.category,
    declaredContentType: source.category,
    title,
    publishedAt: new Date(publishedAtRaw).toISOString(),
    originalUrl,
    tags: normalizeTagList(item.tag_list),
    language: "en",
    ...(summary ? { summary } : {}),
    ...(author ? { author } : {}),
    ...(item.body_markdown ? { bodyRaw: item.body_markdown } : {}),
    ...(item.cover_image ? { coverImage: item.cover_image } : {})
  };
}

export async function fetchDevToArticles(
  source: SourceDefinition,
  freshnessDays: number,
  rule: ApiSourceRule
): Promise<FeedArticle[]> {
  const endpoint = new URL(rule.endpoint);
  endpoint.searchParams.set("top", String(freshnessDays));

  const response = await fetch(endpoint, {
    headers: {
      "user-agent": "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)",
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as DevToArticle[];
  return sortByPublishedDate(
    payload
      .map((item) => mapDevToArticle(source, item))
      .filter((item): item is FeedArticle => item !== null)
      .filter((item) => isFresh(item.publishedAt, freshnessDays))
  );
}
