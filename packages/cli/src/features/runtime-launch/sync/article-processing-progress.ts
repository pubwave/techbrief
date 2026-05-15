export interface ArticleProcessingProgress {
  total: number;
  processed: number;
  saved: number;
}

export function emptyArticleProcessingProgress(): ArticleProcessingProgress {
  return {
    total: 0,
    processed: 0,
    saved: 0
  };
}

export function startArticleProcessingProgress(total: number): ArticleProcessingProgress {
  return {
    total: Math.max(0, total),
    processed: 0,
    saved: 0
  };
}

export function updateProcessedArticleCount(
  current: ArticleProcessingProgress,
  processed: number
): ArticleProcessingProgress {
  return {
    ...current,
    processed: clampArticleCount(processed, current.total)
  };
}

export function updateSavedArticleCount(
  current: ArticleProcessingProgress,
  saved: number
): ArticleProcessingProgress {
  return {
    ...current,
    saved: clampArticleCount(saved, current.total)
  };
}

function clampArticleCount(count: number, total: number): number {
  return Math.min(Math.max(0, count), Math.max(0, total));
}
