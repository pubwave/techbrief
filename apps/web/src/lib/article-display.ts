import type { TiptapDocument } from "@techbrief/shared";
import type { FeedArticle } from "../types/feed";

export interface ArticleDisplayContent {
  title: string;
  summary?: string;
  bodyNormalized?: string;
  bodyTiptapJson?: TiptapDocument;
}

export function resolveArticleDisplayContent(article: FeedArticle): ArticleDisplayContent {
  return {
    title: article.translatedTitle?.trim() || article.title,
    ...(article.translatedSummary?.trim() || article.summary
      ? { summary: article.translatedSummary?.trim() || article.summary }
      : {}),
    ...(article.translatedBodyNormalized?.trim() || article.bodyNormalized
      ? { bodyNormalized: article.translatedBodyNormalized?.trim() || article.bodyNormalized }
      : {}),
    ...(article.translatedBodyTiptapJson || article.bodyTiptapJson
      ? { bodyTiptapJson: article.translatedBodyTiptapJson ?? article.bodyTiptapJson }
      : {})
  };
}
