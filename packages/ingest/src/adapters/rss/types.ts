import type { FeedArticle, SourceDefinition } from "@techbrief/shared";

export interface FetchSourceArticlesInput {
  source: SourceDefinition;
  freshnessDays: number;
}

export interface FetchSourceArticlesResult {
  articles: FeedArticle[];
  skippedReason?: string;
}
