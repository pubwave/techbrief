import { createAiProvider, translateArticleWithIntegrityStream } from "@techbrief/ai";
import { convertContent } from "@techbrief/converter";
import { requiresAiForLanguage, type FeedArticle } from "@techbrief/shared";
import {
  getStoredArticleById,
  loadConfig,
  markArticleProcessing,
  saveProcessedArticle
} from "@techbrief/runtime";
import { withArticleFingerprint } from "./article-reuse.js";

export interface TranslateStoredArticleInput {
  articleId: string;
  targetLanguage: string;
  onStatus?: (status: "loading" | "processing" | "saving" | "completed") => Promise<void> | void;
  onPartialBody?: (input: {
    translatedBodyMarkdown: string;
    translatedBodyNormalized: string;
    translatedBodyTiptapJson: unknown;
    index: number;
    total: number;
  }) => Promise<void> | void;
}

export interface TranslateStoredArticleResult {
  ok: boolean;
  article?: FeedArticle;
  skipped: boolean;
  error?: string;
}

export async function translateStoredArticle(
  input: TranslateStoredArticleInput
): Promise<TranslateStoredArticleResult> {
  const article = await getStoredArticleById(input.articleId, null);
  if (!article) {
    return {
      ok: false,
      skipped: false,
      error: "Article was not found."
    };
  }

  if (!requiresAiForLanguage(input.targetLanguage) || input.targetLanguage === article.language) {
    const resolvedArticle = await getStoredArticleById(input.articleId, input.targetLanguage);
    return {
      ok: true,
      skipped: true,
      ...(resolvedArticle ? { article: resolvedArticle } : {})
    };
  }

  if (hasStoredTranslation(article)) {
    const resolvedArticle = await getStoredArticleById(input.articleId, input.targetLanguage);
    return {
      ok: true,
      skipped: true,
      ...(resolvedArticle ? { article: resolvedArticle } : {})
    };
  }

  await input.onStatus?.("loading");
  const config = await loadConfig();
  await markArticleProcessing(input.articleId, input.targetLanguage);
  await input.onStatus?.("processing");

  const provider = createAiProvider(config.ai);
  const output = await translateArticleWithIntegrityStream(
    provider,
    article,
    input.targetLanguage,
    async ({ translatedBodyMarkdown, index, total }) => {
      const conversion = convertContent({
        sourceId: article.sourceId,
        format: "markdown",
        body: translatedBodyMarkdown
      });
      await input.onPartialBody?.({
        translatedBodyMarkdown,
        translatedBodyNormalized: conversion.bodyNormalized,
        translatedBodyTiptapJson: conversion.bodyTiptapJson,
        index,
        total
      });
    }
  );

  const translatedArticleWithFingerprint = withArticleFingerprint({
    ...article,
    ...(output.summary ? { summary: output.summary } : {}),
    ...(output.translatedTitle ? { translatedTitle: output.translatedTitle } : {}),
    ...(output.translatedSummary ? { translatedSummary: output.translatedSummary } : {}),
    ...(output.translatedBodyMarkdown ? { translatedBodyRaw: output.translatedBodyMarkdown } : {}),
    aiMeta: output.aiMeta
  }, input.targetLanguage);

  await input.onStatus?.("saving");
  const saved = await saveProcessedArticle(translatedArticleWithFingerprint, input.targetLanguage);
  if (!saved) {
    return {
      ok: false,
      skipped: false,
      error: "Missing complete translation body for target language."
    };
  }

  const resolvedArticle = await getStoredArticleById(input.articleId, input.targetLanguage);
  await input.onStatus?.("completed");
  return {
    ok: Boolean(resolvedArticle),
    skipped: false,
    ...(resolvedArticle ? { article: resolvedArticle } : {}),
    ...(resolvedArticle ? {} : { error: "Article was not found." })
  };
}

function hasStoredTranslation(article: FeedArticle): boolean {
  return Boolean(article.translatedBodyRaw?.trim());
}
