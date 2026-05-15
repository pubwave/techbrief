import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import type { FilteredFeedArticle } from "@techbrief/feed-rules";

export interface FeedSyncCallbacks {
  onSourceStart?: (source: SourceDefinition, index: number, total: number) => Promise<void> | void;
  onSourceFetched?: (source: SourceDefinition, articleCount: number, index: number, total: number) => Promise<void> | void;
  onSourceSkipped?: (source: SourceDefinition, reason: string, index: number, total: number) => Promise<void> | void;
  onArticleFiltered?: (entry: FilteredFeedArticle) => Promise<void> | void;
  onRulesApplied?: (keptArticles: number, filteredArticles: number) => Promise<void> | void;
  onEnrichProgress?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
  onArticleEnriched?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
  onArticleSaved?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
  onArticlesSaved?: (savedCount: number, total: number) => Promise<void> | void;
}

export interface RunFeedSyncInput {
  sourceIds?: string[];
  targetLanguage?: string;
  callbacks?: FeedSyncCallbacks;
}

export interface RunFeedSyncResult {
  fetchedSources: string[];
  skippedSources: Array<{ sourceId: string; reason: string }>;
  filteredArticles: FilteredFeedArticle[];
  preparedArticles: number;
  savedArticles: number;
}
