import { buildArticleContentHash, hasArticleSourceBody, requiresAiForLanguage, type FeedArticle } from "@techbrief/shared";

interface ExistingArticleLookup {
  byId: Map<string, FeedArticle>;
  bySourceAndUrl: Map<string, FeedArticle>;
}

export interface ArticleReuseDecision {
  article: FeedArticle;
  shouldProcess: boolean;
}

export function createExistingArticleLookup(articles: FeedArticle[]): ExistingArticleLookup {
  const byId = new Map<string, FeedArticle>();
  const bySourceAndUrl = new Map<string, FeedArticle>();

  for (const article of articles) {
    byId.set(article.id, article);
    bySourceAndUrl.set(articleLookupKey(article), article);
  }

  return {
    byId,
    bySourceAndUrl
  };
}

export function partitionArticlesForReuse(
  incomingArticles: FeedArticle[],
  existingLookup: ExistingArticleLookup,
  targetLanguage: string
): {
  reusableArticles: FeedArticle[];
  articlesToProcess: FeedArticle[];
} {
  const reusableArticles: FeedArticle[] = [];
  const articlesToProcess: FeedArticle[] = [];

  for (const article of incomingArticles) {
    const existingArticle = findExistingArticle(existingLookup, article);
    if (existingArticle && canReuseExistingArticle(existingArticle, article, targetLanguage)) {
      reusableArticles.push(existingArticle);
      continue;
    }

    articlesToProcess.push(article);
  }

  return {
    reusableArticles,
    articlesToProcess
  };
}

export function withArticleFingerprint(
  article: FeedArticle,
  targetLanguage: string
): FeedArticle {
  const currentAiMeta = article.aiMeta ?? {};
  return {
    ...article,
    aiMeta: {
      ...currentAiMeta,
      contentHash: buildArticleContentHash(article),
      targetLanguage,
      requiresAi: requiresAiForLanguage(targetLanguage)
    }
  };
}

export function findExistingSourceArticle(
  lookup: ExistingArticleLookup,
  article: FeedArticle
): FeedArticle | undefined {
  return findExistingArticle(lookup, article);
}

export function hasMatchingSourceFingerprint(existingArticle: FeedArticle, incomingArticle: FeedArticle): boolean {
  const existingContentHash = existingArticle.aiMeta?.contentHash;
  if (typeof existingContentHash !== "string" || !hasArticleSourceBody(incomingArticle)) {
    return false;
  }

  return existingContentHash === buildArticleContentHash(incomingArticle);
}

function canReuseExistingArticle(
  existingArticle: FeedArticle,
  incomingArticle: FeedArticle,
  targetLanguage: string
): boolean {
  if (!hasArticleSourceBody(existingArticle) || !hasArticleSourceBody(incomingArticle)) {
    return false;
  }

  const expectedHash = buildArticleContentHash(incomingArticle);
  const aiMeta = existingArticle.aiMeta ?? {};

  return aiMeta.contentHash === expectedHash
    && aiMeta.targetLanguage === targetLanguage
    && aiMeta.requiresAi === requiresAiForLanguage(targetLanguage);
}

function findExistingArticle(
  lookup: ExistingArticleLookup,
  article: FeedArticle
): FeedArticle | undefined {
  return lookup.byId.get(article.id) ?? lookup.bySourceAndUrl.get(articleLookupKey(article));
}

function articleLookupKey(article: FeedArticle): string {
  return `${article.sourceId}::${article.originalUrl}`;
}
