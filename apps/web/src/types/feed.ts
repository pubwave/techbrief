import type { TiptapDocument } from "@techbrief/shared";

export type Channel = "tech-news" | "indie-dev";
export type ChannelFilter = "all" | Channel;

export interface FeedArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  contentType: Channel;
  declaredContentType: Channel;
  title: string;
  translatedTitle?: string;
  summary?: string;
  translatedSummary?: string;
  author?: string;
  publishedAt: string;
  originalUrl: string;
  tags: string[];
  language: string;
  bodyNormalized?: string;
  bodyTiptapJson?: TiptapDocument;
  translatedBodyRaw?: string;
  translatedBodyNormalized?: string;
  translatedBodyTiptapJson?: TiptapDocument;
  translationStreaming?: {
    active: boolean;
    bodyNormalized?: string;
    bodyTiptapJson?: TiptapDocument;
  };
}

export interface FeedListResponse {
  items: FeedArticle[];
  total: number;
}

export interface FeedPageRequest {
  limit: number;
  offset: number;
}
