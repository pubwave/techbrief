import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import type { ApplyFeedRulesInput, ApplyFeedRulesResult, FilteredFeedArticle } from "./types.js";
import {
  createRuleContext,
  filterArticleBatch,
  listKeptArticles,
  listFilteredArticles
} from "./filter.js";

export interface FeedRuleSession {
  processBatch: (articles: FeedArticle[]) => Promise<FeedArticle[]>;
  getFiltered: () => FilteredFeedArticle[];
  getKeptCount: () => number;
  toResult: () => ApplyFeedRulesResult;
}

export function createFeedRuleSession(input: {
  sources: SourceDefinition[];
  onFiltered?: ApplyFeedRulesInput["onFiltered"];
}): FeedRuleSession {
  const context = createRuleContext(input.sources);

  return {
    processBatch: async (articles) => filterArticleBatch(context, articles, input.onFiltered),
    getFiltered: () => listFilteredArticles(context),
    getKeptCount: () => listKeptArticles(context).length,
    toResult: () => ({
      articles: listKeptArticles(context),
      filtered: listFilteredArticles(context)
    })
  };
}
