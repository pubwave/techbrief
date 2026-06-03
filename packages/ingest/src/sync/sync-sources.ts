import type { FeedArticle, SourceDefinition, SyncRunResult } from "@techbrief/shared";
import { DEFAULT_SOURCES } from "@techbrief/shared";
import { fetchSourceArticles } from "../adapters/fetch-source-articles.js";
import { hydrateArticleBodies } from "../adapters/detail/hydrate-article-body.js";

const DEFAULT_SYNC_SOURCE_CONCURRENCY = 4;

export interface SyncSourcesInput {
  freshnessDays: number;
  sources?: SourceDefinition[];
  concurrency?: number;
  onSourceStart?: (source: SourceDefinition, index: number, total: number) => Promise<void> | void;
  onSourceFetched?: (
    source: SourceDefinition,
    articleCount: number,
    index: number,
    total: number
  ) => Promise<void> | void;
  onSourceSkipped?: (
    source: SourceDefinition,
    reason: string,
    index: number,
    total: number
  ) => Promise<void> | void;
  onSourceArticles?: (
    source: SourceDefinition,
    articles: FeedArticle[],
    index: number,
    total: number
  ) => Promise<void> | void;
}

export type SyncSourcesOutput = SyncRunResult;

export async function syncSources(input: SyncSourcesInput): Promise<SyncSourcesOutput> {
  const sources = input.sources ?? DEFAULT_SOURCES;
  const fetchedSources: string[] = [];
  const skippedSources: Array<{ sourceId: string; reason: string }> = [];
  const concurrency = resolveSyncConcurrency(input.concurrency, sources.length);
  let nextSourceIndex = 0;

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (true) {
        const index = nextSourceIndex;
        nextSourceIndex += 1;

        if (index >= sources.length) {
          return;
        }

        const source = sources[index]!;
        await input.onSourceStart?.(source, index, sources.length);
        const result = await fetchSourceArticles({
          source,
          freshnessDays: input.freshnessDays
        });

        if (result.skippedReason) {
          skippedSources.push({ sourceId: source.id, reason: result.skippedReason });
          await input.onSourceSkipped?.(source, result.skippedReason, index, sources.length);
          continue;
        }

        const hydratedArticles = await hydrateArticleBodies(result.articles);
        fetchedSources.push(source.id);
        await input.onSourceFetched?.(source, hydratedArticles.length, index, sources.length);
        await input.onSourceArticles?.(source, hydratedArticles, index, sources.length);
      }
    })
  );

  return {
    fetchedSources,
    skippedSources,
    savedArticles: 0
  };
}

function resolveSyncConcurrency(requestedConcurrency: number | undefined, sourceCount: number): number {
  const fallback = Math.min(DEFAULT_SYNC_SOURCE_CONCURRENCY, Math.max(sourceCount, 1));
  if (requestedConcurrency === undefined) {
    return fallback;
  }

  return Math.min(Math.max(1, Math.floor(requestedConcurrency)), Math.max(sourceCount, 1));
}
