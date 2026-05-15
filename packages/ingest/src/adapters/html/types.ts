import type { FeedArticle, SourceDefinition } from "@techbrief/shared";

export interface FetchHtmlSourceArticlesInput {
  source: SourceDefinition;
  freshnessDays: number;
}

export interface FetchHtmlSourceArticlesResult {
  articles: FeedArticle[];
  skippedReason?: string;
}

export interface HtmlSourceRule {
  listingUrl?: string;
  maxArticles: number;
  articleLinkPatterns: RegExp[];
  articleSelector?: string;
  titleSelectors?: string[];
  summarySelectors?: string[];
  bodySelectors?: string[];
  authorSelectors?: string[];
  dateSelectors?: string[];
  useGenericAnchorScan?: boolean;
  listingExtractor?: (html: string, source: SourceDefinition) => HtmlArticleCandidate[];
}

export interface HtmlArticleCandidate {
  title?: string;
  originalUrl: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
}
