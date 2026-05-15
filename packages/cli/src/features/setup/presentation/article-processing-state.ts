import type { FeedArticle } from "@techbrief/shared";
import { formatWizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";

export type ArticleProcessingStatus = "processing" | "completed" | "saved" | "failed";

export interface ArticleProcessingState {
  id: string;
  label: string;
  status: ArticleProcessingStatus;
}

const MAX_ARTICLE_PROCESSING_STATES = 5;

export function upsertArticleProcessingState(
  currentStates: ArticleProcessingState[],
  article: FeedArticle,
  status: ArticleProcessingStatus,
  locale: WizardLocale
): ArticleProcessingState[] {
  if (status === "completed" || status === "saved") {
    return currentStates.filter((state) => state.id !== article.id);
  }

  const nextState: ArticleProcessingState = {
    id: article.id,
    label: formatArticleLabel(article, locale),
    status
  };

  const withoutCurrent = currentStates.filter((state) => state.id !== article.id);
  return [...withoutCurrent, nextState].slice(-MAX_ARTICLE_PROCESSING_STATES);
}

export function clearArticleProcessingStates(): ArticleProcessingState[] {
  return [];
}

function formatArticleLabel(article: FeedArticle, locale: WizardLocale): string {
  const title = article.title?.trim() || article.originalUrl || article.id;
  return formatWizardMessage(locale, "articleProcessingLabel", {
    source: article.sourceId,
    title
  });
}
