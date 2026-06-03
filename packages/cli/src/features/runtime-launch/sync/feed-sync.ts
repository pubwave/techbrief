import type { FeedArticle } from "@techbrief/shared";
import { FeedSyncCancelledError, runFeedSync } from "@techbrief/feed";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { appendSyncLogEntry } from "./sync-log.js";
import { startArticleProcessingProgress, type ArticleProcessingProgress } from "./article-processing-progress.js";

export interface FeedSyncCallbacks {
  shouldContinue?: () => Promise<boolean> | boolean;
  onOutput?: (line: string) => Promise<void> | void;
  onSyncPercent?: (percent: number) => Promise<void> | void;
  onSyncSourceProgress?: (sourceId: string, index: number, total: number) => Promise<void> | void;
  onProcessPercent?: (percent: number) => Promise<void> | void;
  onProcessStart?: () => Promise<void> | void;
  onArticleProcessingProgress?: (progress: ArticleProcessingProgress) => Promise<void> | void;
  onArticleStatus?: (article: FeedArticle, status: "processing" | "completed" | "saved") => Promise<void> | void;
  onArticleSaved?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
}

export interface FeedSyncResult {
  ok: boolean;
  detail: string;
  superseded?: boolean;
}

export async function performInitialFeedSync(
  locale: WizardLocale,
  callbacks?: FeedSyncCallbacks
): Promise<FeedSyncResult> {
  try {
    await callbacks?.onSyncPercent?.(0);
    await callbacks?.onOutput?.(wizardMessage(locale, "launchSyncLoadingSources"));

    let sourceProgressCompleted = 0;
    let enrichProgressBucket = -1;
    let processedArticles = 0;
    let savedArticles = 0;

    const result = await runFeedSync({
      ...(callbacks?.shouldContinue ? { shouldContinue: callbacks.shouldContinue } : {}),
      callbacks: {
        onSourceStart: async (source, index, total) => {
          if (index === 0) {
            await callbacks?.onOutput?.(`${wizardMessage(locale, "launchSyncActiveSources")} ${total}`);
          }

          await callbacks?.onOutput?.(formatSourceProgress(locale, "launchSyncSourceStart", source.id, index, total));
        },
        onSourceFetched: async (source, articleCount, index, total) => {
          sourceProgressCompleted += 1;
          await callbacks?.onSyncSourceProgress?.(source.id, sourceProgressCompleted, Math.max(total, 1));
          await callbacks?.onOutput?.(
            `${formatSourceProgress(locale, "launchSyncSourceFetched", source.id, index, total)} ${articleCount}`
          );
        },
        onSourceSkipped: async (source, reason, index, total) => {
          sourceProgressCompleted += 1;
          await callbacks?.onSyncSourceProgress?.(source.id, sourceProgressCompleted, Math.max(total, 1));
          await appendSyncLogEntry({
            phase: "source-skipped",
            sourceId: source.id,
            message: reason
          });
          await callbacks?.onOutput?.(
            `${formatSourceProgress(locale, "launchSyncSourceSkipped", source.id, index, total)} ${reason}`
          );
        },
        onArticleFiltered: async (entry) => {
          await appendSyncLogEntry({
            phase: "source-skipped",
            sourceId: entry.article.sourceId,
            message: formatFilteredArticleLogMessage(entry)
          });
        },
        onRulesApplied: async (keptArticles) => {
          enrichProgressBucket = -1;
          processedArticles = 0;
          savedArticles = 0;
          await callbacks?.onProcessStart?.();
          await callbacks?.onProcessPercent?.(0);
          await callbacks?.onArticleProcessingProgress?.(startArticleProcessingProgress(keptArticles));
        },
        onEnrichProgress: async (article, index, total) => {
          await callbacks?.onArticleStatus?.(article, "processing");
          await callbacks?.onProcessPercent?.(calculateFeedSyncPercent(index + 1, Math.max(total, 1), 1));
          const nextBucket = resolveEnrichProgressBucket(index + 1, total);
          if (nextBucket === enrichProgressBucket && index + 1 < total) {
            return;
          }

          enrichProgressBucket = nextBucket;
        },
        onArticlesSaved: async (savedCount, total) => {
          savedArticles = savedCount;
          await callbacks?.onArticleProcessingProgress?.({
            total,
            processed: Math.min(processedArticles, total),
            saved: savedArticles
          });
          if (savedCount >= total) {
            await callbacks?.onProcessPercent?.(95);
          }
        },
        onArticleEnriched: async (article, index, total) => {
          processedArticles = index + 1;
          await callbacks?.onArticleProcessingProgress?.({
            total,
            processed: processedArticles,
            saved: Math.min(savedArticles, total)
          });
          await callbacks?.onArticleStatus?.(article, "completed");
        },
        onArticleSaved: async (article, index, total) => {
          await callbacks?.onArticleSaved?.(article, index, total);
          await callbacks?.onArticleStatus?.(article, "saved");
        }
      }
    });

    await callbacks?.onArticleProcessingProgress?.({
      total: result.preparedArticles,
      processed: result.preparedArticles,
      saved: result.savedArticles
    });
    await callbacks?.onProcessPercent?.(100);

    return {
      ok: true,
      detail: wizardMessage(locale, "launchSyncCompleted")
    };
  } catch (error) {
    if (error instanceof FeedSyncCancelledError) {
      return {
        ok: false,
        detail: wizardMessage(locale, "launchSyncSuperseded"),
        superseded: true
      };
    }

    await appendSyncLogEntry({
      phase: "sync-failed",
      message: error instanceof Error ? error.stack ?? error.message : wizardMessage(locale, "launchSyncFailedRequest")
    });
    return {
      ok: false,
      detail: error instanceof Error ? error.message : wizardMessage(locale, "launchSyncFailedRequest")
    };
  }
}

function formatFilteredArticleLogMessage(entry: {
  reason: string;
  article: FeedArticle;
  duplicateOf?: FeedArticle;
}): string {
  const base = `${entry.reason}: ${entry.article.originalUrl}`;
  if (!entry.duplicateOf) {
    return base;
  }

  return `${base}\nduplicate-of: ${entry.duplicateOf.sourceId} | ${entry.duplicateOf.originalUrl}`;
}

function calculateFeedSyncPercent(completedUnits: number, totalUnits: number, phaseIndex: 0 | 1): number {
  const boundedTotal = Math.max(totalUnits, 1);
  const boundedCompleted = Math.min(Math.max(completedUnits, 0), boundedTotal);
  const phaseProgress = boundedCompleted / boundedTotal;
  const phaseBase = phaseIndex === 0 ? 0 : 60;
  const phaseRange = phaseIndex === 0 ? 60 : 35;
  return Math.min(95, Math.round(phaseBase + phaseProgress * phaseRange));
}

function formatSourceProgress(
  locale: WizardLocale,
  key: "launchSyncSourceStart" | "launchSyncSourceFetched" | "launchSyncSourceSkipped",
  sourceId: string,
  _index: number,
  _total: number
): string {
  return `${wizardMessage(locale, key)} ${sourceId}`;
}
function resolveEnrichProgressBucket(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  if (completed >= total) {
    return 20;
  }

  return Math.floor((completed / total) * 20);
}
