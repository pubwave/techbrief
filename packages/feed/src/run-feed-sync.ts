import { createFeedRuleSession } from "@techbrief/feed-rules";
import { syncSources } from "@techbrief/ingest";
import { prepareArticles } from "@techbrief/pipeline";
import { hasArticleSourceBody } from "@techbrief/shared";
import {
  beginSyncRun,
  completeSyncRun,
  failSyncRun,
  listAllSources,
  loadConfig,
  loadArticlesForReuse,
  recordSyncSourceResult,
  upsertFetchedArticles
} from "@techbrief/runtime";
import type { RunFeedSyncInput, RunFeedSyncResult } from "./types.js";
import {
  createExistingArticleLookup,
  findExistingSourceArticle,
  hasMatchingSourceFingerprint
} from "./article-reuse.js";

export class FeedSyncCancelledError extends Error {
  constructor(message = "Feed sync was cancelled.") {
    super(message);
    this.name = "FeedSyncCancelledError";
  }
}

export async function runFeedSync(input: RunFeedSyncInput = {}): Promise<RunFeedSyncResult> {
  const config = await loadConfig();
  const targetLanguage = input.targetLanguage ?? config.app.defaultLanguage;
  const syncRunId = await beginSyncRun(targetLanguage);
  const sources = await listAllSources();
  const activeSources = sources
    .filter((source) => source.state === "enabled")
    .filter((source) => !input.sourceIds || input.sourceIds.includes(source.id));

  try {
    await assertFeedSyncShouldContinue(input);
    const existingLookup = createExistingArticleLookup(await loadArticlesForReuse(targetLanguage));
    const ruleSession = createFeedRuleSession({
      sources: activeSources,
      ...(input.callbacks?.onArticleFiltered ? { onFiltered: input.callbacks.onArticleFiltered } : {})
    });
    const syncResult = await syncSources({
      freshnessDays: config.app.freshnessDays,
      sources: activeSources,
      onSourceStart: async (source, index, total) => {
        await assertFeedSyncShouldContinue(input);
        await input.callbacks?.onSourceStart?.(source, index, total);
      },
      onSourceFetched: async (source, articleCount, index, total) => {
        await assertFeedSyncShouldContinue(input);
        await recordSyncSourceResult({
          runId: syncRunId,
          sourceId: source.id,
          status: "fetched",
          articleCount
        });
        await input.callbacks?.onSourceFetched?.(source, articleCount, index, total);
      },
      onSourceArticles: async (_source, articles) => {
        await assertFeedSyncShouldContinue(input);
        await ruleSession.processBatch(articles);
      },
      onSourceSkipped: async (source, reason, index, total) => {
        await assertFeedSyncShouldContinue(input);
        await recordSyncSourceResult({
          runId: syncRunId,
          sourceId: source.id,
          status: "skipped",
          message: reason
        });
        await input.callbacks?.onSourceSkipped?.(source, reason, index, total);
      }
    });
    await assertFeedSyncShouldContinue(input);
    const ruled = ruleSession.toResult();
    await input.callbacks?.onRulesApplied?.(ruled.articles.length, ruled.filtered.length);
    await assertFeedSyncShouldContinue(input);

    const preparedArticles = (await prepareArticles({
      articles: ruled.articles,
      onProgress: async (article, index, total) => {
        await assertFeedSyncShouldContinue(input);
        await input.callbacks?.onEnrichProgress?.(article, index, total);
      },
      onArticlePrepared: async (article, index, total) => {
        await assertFeedSyncShouldContinue(input);
        await input.callbacks?.onArticleEnriched?.(article, index, total);
      }
    })).filter((article) => hasArticleSourceBody(article));
    await assertFeedSyncShouldContinue(input);

    const articlesToUpsert = preparedArticles.filter((article) => {
      const existingArticle = findExistingSourceArticle(existingLookup, article);
      return !existingArticle || !hasMatchingSourceFingerprint(existingArticle, article);
    });

    await assertFeedSyncShouldContinue(input);
    await upsertFetchedArticles(articlesToUpsert, targetLanguage);

    for (const [index, article] of preparedArticles.entries()) {
      await assertFeedSyncShouldContinue(input);
      const savedCount = index + 1;
      await input.callbacks?.onArticleSaved?.(article, index, preparedArticles.length);
      await input.callbacks?.onArticlesSaved?.(savedCount, preparedArticles.length);
    }

    const result = {
      fetchedSources: syncResult.fetchedSources,
      skippedSources: syncResult.skippedSources,
      filteredArticles: ruled.filtered,
      preparedArticles: preparedArticles.length,
      savedArticles: preparedArticles.length
    };
    await completeSyncRun(syncRunId);
    return result;
  } catch (error) {
    await failSyncRun(syncRunId, error instanceof Error ? error.message : "Unknown sync failure");
    throw error;
  }
}

async function assertFeedSyncShouldContinue(input: RunFeedSyncInput): Promise<void> {
  if (!input.shouldContinue) {
    return;
  }

  if (!await input.shouldContinue()) {
    throw new FeedSyncCancelledError();
  }
}
