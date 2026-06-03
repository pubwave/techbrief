import { createAiProvider, translateArticleWithIntegrityStream } from "@techbrief/ai";
import { convertContent } from "@techbrief/converter";
import { requiresAiForLanguage, type FeedArticle } from "@techbrief/shared";
import {
  getStoredArticleById,
  loadConfig,
  markArticleProcessing,
  markArticleTranslationFailed,
  saveProcessedArticle
} from "@techbrief/runtime";
import { withArticleFingerprint } from "./article-reuse.js";
import { validateTranslationOutputLanguage } from "./translation-output-validation.js";

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
  // Load with the target language so hasStoredTranslation() can actually see an
  // existing translation (loading with null joins on target_language = NULL,
  // which never matches, making the skip check below dead). When no translation
  // exists, mapStoredArticleRow returns the original-language base, so the text
  // handed to the translator stays the source — not an already-translated body.
  const article = await getStoredArticleById(input.articleId, input.targetLanguage);
  if (!article) {
    return {
      ok: false,
      skipped: false,
      error: "Article was not found."
    };
  }

  if (!requiresAiForLanguage(input.targetLanguage) || input.targetLanguage === article.language) {
    return {
      ok: true,
      skipped: true,
      article
    };
  }

  if (hasStoredTranslation(article)) {
    return {
      ok: true,
      skipped: true,
      article
    };
  }

  await input.onStatus?.("loading");
  const config = await loadConfig();
  await markArticleProcessing(input.articleId, input.targetLanguage);
  await input.onStatus?.("processing");

  try {
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

    const languageValidation = validateTranslationOutputLanguage({
      sourceArticle: article,
      targetLanguage: input.targetLanguage,
      translatedTitle: output.translatedTitle,
      translatedSummary: output.translatedSummary,
      translatedBodyMarkdown: output.translatedBodyMarkdown
    });
    if (!languageValidation.valid) {
      throw new Error(languageValidation.error ?? "Translation output did not match target language.");
    }

    const finalBodyConversion = output.translatedBodyMarkdown
      ? convertContent({ sourceId: article.sourceId, format: "markdown", body: output.translatedBodyMarkdown })
      : null;

    const translatedArticleWithFingerprint = withArticleFingerprint({
      ...article,
      ...(output.summary ? { summary: output.summary } : {}),
      ...(output.translatedTitle ? { translatedTitle: output.translatedTitle } : {}),
      ...(output.translatedSummary ? { translatedSummary: output.translatedSummary } : {}),
      ...(output.translatedBodyMarkdown ? { translatedBodyRaw: output.translatedBodyMarkdown } : {}),
      ...(finalBodyConversion?.bodyNormalized ? { translatedBodyNormalized: finalBodyConversion.bodyNormalized } : {}),
      ...(finalBodyConversion?.bodyTiptapJson ? { translatedBodyTiptapJson: finalBodyConversion.bodyTiptapJson } : {}),
      aiMeta: output.aiMeta
    }, input.targetLanguage);

    await input.onStatus?.("saving");
    const saved = await saveProcessedArticle(translatedArticleWithFingerprint, input.targetLanguage);
    if (!saved) {
      throw new Error("Missing complete translation body for target language.");
    }

    const resolvedArticle = await getStoredArticleById(input.articleId, input.targetLanguage);
    await input.onStatus?.("completed");
    return {
      ok: Boolean(resolvedArticle),
      skipped: false,
      ...(resolvedArticle ? { article: resolvedArticle } : {}),
      ...(resolvedArticle ? {} : { error: "Article was not found." })
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed.";
    await markArticleTranslationFailed(input.articleId, input.targetLanguage, message);
    return {
      ok: false,
      skipped: false,
      error: message
    };
  }
}

function hasStoredTranslation(article: FeedArticle): boolean {
  return Boolean(article.translatedBodyRaw?.trim()) && Boolean(article.translatedTitle?.trim());
}
