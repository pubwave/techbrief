import type { FeedArticle } from "@techbrief/shared";
import { getArticleSourceBody, getArticlePromptBody } from "@techbrief/shared";
import { serializeAstToMarkdown } from "@techbrief/converter";
import type { AiOutput, AiProvider } from "../types.js";
import { splitIntoChunks } from "./body-chunker.js";
import {
  translateBodyChunksWithProgress,
  translateBodyInChunks,
  type BodyChunkProgressHandler
} from "./body-chunk-translator.js";
import { isTranslationComplete } from "./translation-completeness.js";

function getTranslationSourceBody(article: FeedArticle): string | undefined {
  if (article.bodyAst) {
    const markdown = serializeAstToMarkdown(
      article.bodyAst as Parameters<typeof serializeAstToMarkdown>[0]
    ).trim();
    if (markdown) {
      return markdown;
    }
  }
  const normalized = article.bodyNormalized?.trim();
  if (normalized) {
    return normalized;
  }
  return getArticleSourceBody(article);
}

const PREVIEW_BODY_LIMIT = 4000;
const DEFAULT_CHUNK_SIZE = 3200;
const FALLBACK_CHUNK_SIZE = 2200;

export async function translateArticleWithIntegrity(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string
): Promise<AiOutput> {
  const sourceBody = getTranslationSourceBody(article);
  if (!sourceBody) {
    return provider.summarizeAndTranslate(article, targetLanguage);
  }

  if (sourceBody.length <= PREVIEW_BODY_LIMIT) {
    const singlePass = await provider.summarizeAndTranslate(article, targetLanguage);
    return ensureTranslationIntegrity(provider, article, targetLanguage, singlePass, sourceBody);
  }

  return translateLongArticle(provider, article, targetLanguage, sourceBody);
}

export async function translateArticleWithIntegrityStream(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  onBodyChunk?: BodyChunkProgressHandler
): Promise<AiOutput> {
  const sourceBody = getTranslationSourceBody(article);
  if (!sourceBody) {
    return provider.summarizeAndTranslate(article, targetLanguage);
  }

  const chunks = splitIntoChunks(
    sourceBody,
    sourceBody.length <= PREVIEW_BODY_LIMIT ? FALLBACK_CHUNK_SIZE : DEFAULT_CHUNK_SIZE
  );
  const metadataSource = sourceBody.length <= PREVIEW_BODY_LIMIT
    ? sourceBody
    : sourceBody.slice(0, PREVIEW_BODY_LIMIT);

  const [translatedBody, metadataOutput] = await Promise.all([
    translateBodyChunksWithProgress(provider, article, targetLanguage, chunks, onBodyChunk),
    provider.summarizeAndTranslate(withArticleBody(article, metadataSource), targetLanguage)
  ]);

  return mergeTranslationOutput({
    metadataOutput,
    streamedBody: translatedBody,
    sourceBody,
    targetLanguage,
    strategy: "streamed"
  });
}

async function translateLongArticle(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  sourceBody: string
): Promise<AiOutput> {
  const [translatedBody, metadataOutput] = await Promise.all([
    translateLongArticleBody(provider, article, targetLanguage, sourceBody),
    provider.summarizeAndTranslate(
      withArticleBody(article, sourceBody.slice(0, PREVIEW_BODY_LIMIT)),
      targetLanguage
    )
  ]);

  return mergeTranslationOutput({
    metadataOutput,
    streamedBody: translatedBody,
    sourceBody,
    targetLanguage,
    strategy: "chunked"
  });
}

async function translateLongArticleBody(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  sourceBody: string
): Promise<string> {
  const primary = await translateBodyInChunks(
    provider,
    article,
    targetLanguage,
    splitIntoChunks(sourceBody, DEFAULT_CHUNK_SIZE)
  );
  if (isTranslationComplete(sourceBody, primary, targetLanguage)) {
    return primary;
  }

  return translateBodyInChunks(
    provider,
    article,
    targetLanguage,
    splitIntoChunks(sourceBody, FALLBACK_CHUNK_SIZE)
  );
}

async function ensureTranslationIntegrity(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  output: AiOutput,
  sourceBody: string
): Promise<AiOutput> {
  const translatedBody = output.translatedBodyMarkdown?.trim() ?? "";
  if (translatedBody && isTranslationComplete(sourceBody, translatedBody, targetLanguage)) {
    return {
      ...output,
      translatedBodyMarkdown: translatedBody,
      aiMeta: {
        ...output.aiMeta,
        translationBodyComplete: true
      }
    };
  }

  const retried = await translateBodyInChunks(
    provider,
    article,
    targetLanguage,
    splitIntoChunks(sourceBody, FALLBACK_CHUNK_SIZE)
  );
  const finalBody = retried || translatedBody;
  return {
    ...output,
    ...(finalBody ? { translatedBodyMarkdown: finalBody } : {}),
    aiMeta: {
      ...output.aiMeta,
      translationStrategy: "single-pass-then-chunked",
      translationBodyComplete: isTranslationComplete(sourceBody, finalBody, targetLanguage)
    }
  };
}

function mergeTranslationOutput(input: {
  metadataOutput: AiOutput;
  streamedBody: string;
  sourceBody: string;
  targetLanguage: string;
  strategy: string;
}): AiOutput {
  const finalBody = input.streamedBody || input.metadataOutput.translatedBodyMarkdown?.trim() || "";
  return {
    ...input.metadataOutput,
    ...(finalBody ? { translatedBodyMarkdown: finalBody } : {}),
    aiMeta: {
      ...input.metadataOutput.aiMeta,
      translationStrategy: input.strategy,
      translationBodyComplete: isTranslationComplete(input.sourceBody, finalBody, input.targetLanguage)
    }
  };
}

function withArticleBody(article: FeedArticle, body: string): FeedArticle {
  return {
    ...article,
    bodyRaw: body,
    bodyNormalized: body,
    ...(article.summary ? { summary: article.summary } : { summary: getArticlePromptBody(article) })
  };
}
