import type { TiptapDocument } from "@techbrief/shared";
import { requiresAiForLanguage } from "@techbrief/shared";
import type { FeedArticle } from "../types/feed";

export function shouldRequestTranslation(article: FeedArticle, language: string): boolean {
  if (!requiresAiForLanguage(language) || article.language === language) {
    return false;
  }

  return !hasStoredTranslation(article);
}

export function createTranslationStreamingState(partial: {
  translatedBodyNormalized: string;
  translatedBodyTiptapJson?: unknown;
}): NonNullable<FeedArticle["translationStreaming"]> {
  if (partial.translatedBodyTiptapJson) {
    return {
      active: true,
      bodyNormalized: partial.translatedBodyNormalized,
      bodyTiptapJson: partial.translatedBodyTiptapJson as TiptapDocument
    };
  }

  return {
    active: true,
    bodyNormalized: partial.translatedBodyNormalized
  };
}

export function clearTranslationStreaming(article: FeedArticle): FeedArticle {
  if (!article.translationStreaming) {
    return article;
  }

  const { translationStreaming: _translationStreaming, ...rest } = article;
  return rest;
}

function hasStoredTranslation(article: FeedArticle): boolean {
  return Boolean(
    article.translatedBodyTiptapJson
    || article.translatedBodyNormalized?.trim()
    || article.translatedBodyRaw?.trim()
  );
}
