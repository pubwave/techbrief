import type { FeedArticle, SourceDefinition } from "@techbrief/shared";

export interface FilteredFeedArticle {
  article: FeedArticle;
  reason:
    | "invalid-title"
    | "invalid-url"
    | "invalid-body"
    | "invalid-published-at"
    | "blocked-weak-source-url"
    | "blocked-weak-source-title"
    | "duplicate-normalized-url"
    | "duplicate-content-hash";
  duplicateOf?: FeedArticle;
}

export interface ApplyFeedRulesInput {
  articles: FeedArticle[];
  sources: SourceDefinition[];
  onFiltered?: (entry: FilteredFeedArticle) => Promise<void> | void;
}

export interface ApplyFeedRulesResult {
  articles: FeedArticle[];
  filtered: FilteredFeedArticle[];
}
