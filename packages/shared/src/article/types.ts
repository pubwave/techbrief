import type { ContentType } from "../content/types.js";

export interface FeedArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  contentType: ContentType;
  declaredContentType: ContentType;
  title: string;
  translatedTitle?: string;
  summary?: string;
  translatedSummary?: string;
  author?: string;
  publishedAt: string;
  originalUrl: string;
  sourceUrl?: string;
  coverImage?: string;
  tags: string[];
  language: string;
  bodyRaw?: string;
  bodyNormalized?: string;
  bodyAst?: unknown;
  bodyTiptapJson?: unknown;
  translatedBodyRaw?: string;
  translatedBodyNormalized?: string;
  translatedBodyAst?: unknown;
  translatedBodyTiptapJson?: unknown;
  aiMeta?: Record<string, unknown>;
}

export interface SyncRunResult {
  fetchedSources: string[];
  skippedSources: Array<{ sourceId: string; reason: string }>;
  savedArticles: number;
}
