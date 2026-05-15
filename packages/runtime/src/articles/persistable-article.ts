import { hasArticleSourceBody, type FeedArticle } from "@techbrief/shared";

export function hasPersistableArticleBody(article: FeedArticle): boolean {
  return hasArticleSourceBody(article);
}

export function filterPersistableArticles(articles: FeedArticle[]): FeedArticle[] {
  return articles.filter(hasPersistableArticleBody);
}
