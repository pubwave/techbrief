import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import { createArticleId } from "../shared/article-utils.js";

export interface HtmlArticleDetail {
  originalUrl: string;
  title: string;
  publishedAt: string;
  summary?: string;
  author?: string;
  bodyRaw?: string;
  coverImage?: string;
}

export function mapHtmlDetailToArticle(source: SourceDefinition, detail: HtmlArticleDetail): FeedArticle {
  return {
    id: createArticleId(source, detail.originalUrl),
    sourceId: source.id,
    sourceName: source.name,
    contentType: source.category,
    declaredContentType: source.category,
    title: detail.title,
    publishedAt: detail.publishedAt,
    originalUrl: detail.originalUrl,
    tags: source.tags,
    language: "en",
    ...(detail.summary ? { summary: detail.summary } : {}),
    ...(detail.author ? { author: detail.author } : {}),
    ...(detail.bodyRaw ? { bodyRaw: detail.bodyRaw } : {}),
    ...(detail.coverImage ? { coverImage: detail.coverImage } : {})
  };
}
