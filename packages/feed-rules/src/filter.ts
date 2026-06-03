import crypto from "node:crypto";
import { buildArticleBodyFingerprint, hasArticleSourceBody, type FeedArticle, type SourceDefinition } from "@techbrief/shared";
import type { ApplyFeedRulesInput, ApplyFeedRulesResult, FilteredFeedArticle } from "./types.js";
import { isWeakSource } from "./source-trust.js";
import { isBlockedWeakSourceTitle, normalizeWhitespace } from "./title.js";
import { normalizeArticleUrl } from "./url.js";

const WEAK_SOURCE_URL_BLOCKLIST = [/\/(login|signup|privacy|terms|search|forums|bookmarks)(\/|$)/i, /\/(tag|tags|discussions)(\/|$)/i];
const DUPLICATE_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function applyFeedRules(input: ApplyFeedRulesInput): Promise<ApplyFeedRulesResult> {
  const context = createRuleContext(input.sources);
  await filterArticleBatch(context, input.articles, input.onFiltered);
  return {
    articles: listKeptArticles(context),
    filtered: listFilteredArticles(context)
  };
}

export interface FeedRuleContext {
  sourcesById: Map<string, SourceDefinition>;
  keptByUrlKey: Map<string, FeedArticle>;
  keptByContentKey: Map<string, FeedArticle>;
  filtered: FilteredFeedArticle[];
}

export function createRuleContext(sources: SourceDefinition[]): FeedRuleContext {
  return {
    sourcesById: new Map(sources.map((source) => [source.id, source])),
    keptByUrlKey: new Map<string, FeedArticle>(),
    keptByContentKey: new Map<string, FeedArticle>(),
    filtered: []
  };
}

export async function filterArticleBatch(
  context: FeedRuleContext,
  articles: FeedArticle[],
  onFiltered?: ApplyFeedRulesInput["onFiltered"]
): Promise<FeedArticle[]> {
  const keptBefore = new Set(context.keptByUrlKey.keys());

  for (const rawArticle of articles) {
    const source = context.sourcesById.get(rawArticle.sourceId);
    const normalizedUrl = normalizeArticleUrl(rawArticle.originalUrl);
    if (!normalizedUrl) {
      await pushFiltered(context.filtered, onFiltered, rawArticle, "invalid-url");
      continue;
    }

    const normalizedTitle = normalizeWhitespace(rawArticle.title);
    if (normalizedTitle.length === 0) {
      await pushFiltered(context.filtered, onFiltered, rawArticle, "invalid-title");
      continue;
    }

    const publishedAtMs = Date.parse(rawArticle.publishedAt);
    if (!Number.isFinite(publishedAtMs)) {
      await pushFiltered(context.filtered, onFiltered, rawArticle, "invalid-published-at");
      continue;
    }

    // Only drop articles with no body at all. Length/paragraph thresholds are
    // intentionally not applied here: short posts (release notes, indie-dev
    // writing, official announcements) are valid content.
    if (!hasArticleSourceBody(rawArticle)) {
      await pushFiltered(context.filtered, onFiltered, rawArticle, "invalid-body");
      continue;
    }

    if (isWeakSource(source)) {
      if (WEAK_SOURCE_URL_BLOCKLIST.some((pattern) => pattern.test(normalizedUrl))) {
        await pushFiltered(context.filtered, onFiltered, rawArticle, "blocked-weak-source-url");
        continue;
      }

      if (isBlockedWeakSourceTitle(normalizedTitle)) {
        await pushFiltered(context.filtered, onFiltered, rawArticle, "blocked-weak-source-title");
        continue;
      }
    }

    const article = normalizeArticle(rawArticle, normalizedUrl, normalizedTitle);
    const urlKey = `${article.sourceId}:${normalizedUrl}`;
    const existingUrlArticle = context.keptByUrlKey.get(urlKey);
    if (existingUrlArticle) {
      const preferredUrlArticle = preferArticle(existingUrlArticle, article, context.sourcesById);
      const rejectedUrlArticle = preferredUrlArticle === article ? existingUrlArticle : article;
      context.keptByUrlKey.set(urlKey, preferredUrlArticle);
      await pushFiltered(
        context.filtered,
        onFiltered,
        rejectedUrlArticle,
        "duplicate-normalized-url",
        preferredUrlArticle
      );
      continue;
    }

    const bodyFingerprint = buildArticleBodyFingerprint(article);
    const existingContentArticle = bodyFingerprint ? context.keptByContentKey.get(bodyFingerprint) : undefined;
    if (bodyFingerprint && existingContentArticle && arePublishedWithinWindow(existingContentArticle, article)) {
      const preferredContentArticle = preferArticle(existingContentArticle, article, context.sourcesById);
      const rejectedContentArticle = preferredContentArticle === article ? existingContentArticle : article;
      if (preferredContentArticle !== existingContentArticle) {
        context.keptByUrlKey.delete(`${existingContentArticle.sourceId}:${existingContentArticle.originalUrl}`);
      }
      context.keptByContentKey.set(bodyFingerprint, preferredContentArticle);
      context.keptByUrlKey.set(`${preferredContentArticle.sourceId}:${preferredContentArticle.originalUrl}`, preferredContentArticle);
      await pushFiltered(
        context.filtered,
        onFiltered,
        rejectedContentArticle,
        "duplicate-content-hash",
        preferredContentArticle
      );
      continue;
    }

    context.keptByUrlKey.set(urlKey, article);
    if (bodyFingerprint) {
      context.keptByContentKey.set(bodyFingerprint, article);
    }
  }

  return listKeptArticles(context).filter((article) => !keptBefore.has(`${article.sourceId}:${article.originalUrl}`));
}

export function listKeptArticles(context: FeedRuleContext): FeedArticle[] {
  return [...context.keptByUrlKey.values()].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export function listFilteredArticles(context: FeedRuleContext): FilteredFeedArticle[] {
  return [...context.filtered];
}

function normalizeArticle(article: FeedArticle, normalizedUrl: string, normalizedTitle: string): FeedArticle {
  return {
    ...article,
    id: crypto.createHash("sha1").update(`${article.sourceId}:${normalizedUrl}`).digest("hex"),
    title: normalizedTitle,
    originalUrl: normalizedUrl,
    ...(article.summary ? { summary: normalizeWhitespace(article.summary) } : {})
  };
}

function preferArticle(
  current: FeedArticle,
  candidate: FeedArticle,
  sourcesById: Map<string, SourceDefinition>
): FeedArticle {
  return computeArticleScore(candidate, sourcesById) > computeArticleScore(current, sourcesById) ? candidate : current;
}

function computeArticleScore(article: FeedArticle, sourcesById: Map<string, SourceDefinition>): number {
  const source = sourcesById.get(article.sourceId);
  return [
    isWeakSource(source) ? 0 : 10,
    article.summary ? 3 : 0,
    article.author ? 2 : 0,
    article.bodyRaw ? 2 : 0,
    article.bodyNormalized ? 1 : 0
  ].reduce((sum, value) => sum + value, 0);
}

function arePublishedWithinWindow(left: FeedArticle, right: FeedArticle): boolean {
  return Math.abs(Date.parse(left.publishedAt) - Date.parse(right.publishedAt)) <= DUPLICATE_WINDOW_MS;
}

async function pushFiltered(
  filtered: FilteredFeedArticle[],
  onFiltered: ApplyFeedRulesInput["onFiltered"],
  article: FeedArticle,
  reason: FilteredFeedArticle["reason"],
  duplicateOf?: FeedArticle
): Promise<void> {
  const entry = {
    article,
    reason,
    ...(duplicateOf ? { duplicateOf } : {})
  };
  filtered.push(entry);
  await onFiltered?.(entry);
}
