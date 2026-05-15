import { getArticlePromptBody } from "@techbrief/shared";
import type { FeedArticle } from "@techbrief/shared";
import type { AiProvider } from "../types.js";

const PARTIAL_EMIT_INTERVAL_MS = 120;

export interface BodyChunkProgressInput {
  translatedChunk: string;
  translatedBodyMarkdown: string;
  index: number;
  total: number;
}

export type BodyChunkProgressHandler = (input: BodyChunkProgressInput) => Promise<void> | void;

export async function translateBodyInChunks(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  chunks: string[]
): Promise<string> {
  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    const translatedChunk = await translateSingleChunk(provider, article, targetLanguage, chunk);
    if (!translatedChunk) {
      continue;
    }

    translatedChunks.push(translatedChunk);
  }

  return translatedChunks.join("\n\n").trim();
}

export async function translateBodyChunksWithProgress(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  chunks: string[],
  onBodyChunk?: BodyChunkProgressHandler
): Promise<string> {
  const translatedChunks: string[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const emitProgress = createProgressEmitter({
      translatedChunks,
      index,
      total: chunks.length,
      ...(onBodyChunk ? { onBodyChunk } : {})
    });

    const translatedChunk = await translateSingleChunk(
      provider,
      article,
      targetLanguage,
      chunk,
      emitProgress
    );

    if (!translatedChunk) {
      continue;
    }

    translatedChunks.push(translatedChunk);
    await onBodyChunk?.({
      translatedChunk,
      translatedBodyMarkdown: translatedChunks.join("\n\n").trim(),
      index,
      total: chunks.length
    });
  }

  return translatedChunks.join("\n\n").trim();
}

async function translateSingleChunk(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string,
  chunk: string,
  onDelta?: (inProgress: string) => void
): Promise<string> {
  if (provider.translateBodyChunk) {
    const translated = await provider.translateBodyChunk({
      article,
      body: chunk,
      targetLanguage,
      ...(onDelta ? { onDelta: createDeltaAccumulator(onDelta) } : {})
    });
    return translated.trim();
  }

  const metadata = await provider.summarizeAndTranslate(
    withArticleBody(article, chunk),
    targetLanguage
  );
  return metadata.translatedBodyMarkdown?.trim() ?? "";
}

function createDeltaAccumulator(onInProgress: (inProgress: string) => void): (delta: string) => void {
  let accumulated = "";
  return (delta) => {
    accumulated += delta;
    onInProgress(accumulated);
  };
}

function createProgressEmitter(input: {
  translatedChunks: string[];
  index: number;
  total: number;
  onBodyChunk?: BodyChunkProgressHandler;
}): (inProgress: string) => void {
  if (!input.onBodyChunk) {
    return () => undefined;
  }

  let lastEmitAt = 0;
  return (inProgress) => {
    const now = Date.now();
    if (now - lastEmitAt < PARTIAL_EMIT_INTERVAL_MS) {
      return;
    }

    lastEmitAt = now;
    const merged = inProgress
      ? [...input.translatedChunks, inProgress].join("\n\n").trim()
      : input.translatedChunks.join("\n\n").trim();
    void input.onBodyChunk?.({
      translatedChunk: inProgress,
      translatedBodyMarkdown: merged,
      index: input.index,
      total: input.total
    });
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
