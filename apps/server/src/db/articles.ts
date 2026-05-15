import { getStoredArticleById, listStoredArticles } from "@techbrief/runtime";
import type { FeedArticle } from "@techbrief/shared";

export interface ListArticlesInput {
  category?: string | null;
  preferredLanguage?: string | null;
  sourceId?: string | null;
  offset: number;
  limit: number;
}

export async function listArticles(input: ListArticlesInput): Promise<{ items: FeedArticle[]; total: number }> {
  return listStoredArticles(input);
}

export async function getArticleById(articleId: string, preferredLanguage?: string | null): Promise<FeedArticle | null> {
  return getStoredArticleById(articleId, preferredLanguage);
}
