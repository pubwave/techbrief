import type { FeedArticle, SourceDefinition } from "@techbrief/shared";

export interface FetchApiSourceArticlesInput {
  source: SourceDefinition;
  freshnessDays: number;
}

export interface FetchApiSourceArticlesResult {
  articles: FeedArticle[];
  skippedReason?: string;
}

export interface ApiSourceRule {
  endpoint: string;
  sourceNote?: string;
}
