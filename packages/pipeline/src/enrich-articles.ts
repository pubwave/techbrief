import { createAiProvider, processArticleWithAi } from "@techbrief/ai";
import { getArticleSourceBody, type AiConfig } from "@techbrief/shared";
import { convertContent } from "@techbrief/converter";
import { extractSummary } from "@techbrief/summarizer";
import type { FeedArticle } from "@techbrief/shared";

export interface EnrichArticlesInput {
  articles: FeedArticle[];
  ai: AiConfig;
  targetLanguage: string;
  onProgress?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
  onArticleEnriched?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
}

export interface PrepareArticlesInput {
  articles: FeedArticle[];
  onProgress?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
  onArticlePrepared?: (article: FeedArticle, index: number, total: number) => Promise<void> | void;
}

const DEFAULT_ENRICH_CONCURRENCY = 3;
const LOCAL_ENRICH_CONCURRENCY = 1;

const SUMMARY_SENTENCES = 3;

// Markers feeds append when they ship only a truncated lead-in instead of a real
// summary (e.g. NVIDIA blog "… between what [...]"). Such a "summary" is not a
// summary, so it is replaced with a TextRank extract of the body.
const TRUNCATION_MARKERS = [
  /\[\s*[.…]+\s*\]\s*$/,
  /[.。]{3,}\s*$/,
  /…\s*$/,
  /\b(read more|continue reading|keep reading)\b[\s.…]*$/i
];

function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * A feed-provided summary is a genuine summary unless it is just a truncated
 * lead-in: it ends with a truncation marker, or (ignoring any marker) it is a
 * verbatim prefix of the article body.
 */
function isTruncatedExcerpt(summary: string, body: string | undefined): boolean {
  if (TRUNCATION_MARKERS.some((pattern) => pattern.test(summary))) {
    return true;
  }

  if (!body) {
    return false;
  }

  const stripped = summary
    .replace(/\[\s*[.…]+\s*\]\s*$/, "")
    .replace(/[.…]+\s*$/, "")
    .trim();
  if (!stripped) {
    return false;
  }

  return normalizeForCompare(body).startsWith(normalizeForCompare(stripped));
}

/**
 * Keep a genuine feed-provided summary; otherwise (missing, or just a truncated
 * lead-in of the body) derive an extractive TextRank summary from the body.
 */
function deriveSummary(article: FeedArticle, normalizedBody: string | undefined): string | undefined {
  const existing = article.summary?.trim();
  const body = normalizedBody?.trim();

  if (existing && !isTruncatedExcerpt(existing, body)) {
    return existing;
  }

  if (!body) {
    return existing;
  }

  const summary = extractSummary(body, { sentences: SUMMARY_SENTENCES });
  return summary || existing;
}

function articleText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return fallback;
  }

  return String(value);
}

function convertArticle(article: FeedArticle): FeedArticle {
  const sourceBody = getArticleSourceBody(article);
  const sourceConversion = convertContent({
    sourceId: article.sourceId,
    format: detectContentFormat(sourceBody),
    body: sourceBody ?? articleText(article.title, "")
  });
  const translatedBodySource = articleText(article.translatedBodyRaw, "");
  const translatedConversion =
    translatedBodySource
      ? convertContent({
          sourceId: article.sourceId,
          format: "markdown",
          body: translatedBodySource
        })
      : null;

  const summary = deriveSummary(article, sourceConversion.bodyNormalized);

  return {
    ...article,
    ...(sourceBody
      ? {
          bodyRaw: sourceBody,
          bodyNormalized: sourceConversion.bodyNormalized,
          bodyAst: sourceConversion.bodyAst,
          bodyTiptapJson: sourceConversion.bodyTiptapJson
        }
      : {}),
    ...(translatedConversion
      ? {
          translatedBodyRaw: translatedBodySource,
          translatedBodyNormalized: translatedConversion.bodyNormalized,
          translatedBodyAst: translatedConversion.bodyAst,
          translatedBodyTiptapJson: translatedConversion.bodyTiptapJson
        }
      : {}),
    ...(summary ? { summary } : {})
  };
}

export async function prepareArticles(input: PrepareArticlesInput): Promise<FeedArticle[]> {
  const prepared: FeedArticle[] = [];
  const total = input.articles.length;

  for (const [index, article] of input.articles.entries()) {
    await input.onProgress?.(article, index, total);
    const preparedArticle = convertArticle(article);
    prepared.push(preparedArticle);
    await input.onArticlePrepared?.(preparedArticle, index, total);
  }

  return prepared;
}

export async function enrichArticles(input: EnrichArticlesInput): Promise<FeedArticle[]> {
  const enriched: FeedArticle[] = new Array(input.articles.length);
  const total = input.articles.length;
  const concurrency = resolveEnrichConcurrency(input.ai);
  let nextIndex = 0;
  let flushIndex = 0;
  let flushChain = Promise.resolve();

  const workers = Array.from({ length: Math.min(concurrency, Math.max(total, 1)) }, async () => {
    const provider = createAiProvider(input.ai);

    while (true) {
      const index = nextIndex;
      if (index >= total) {
        return;
      }

      nextIndex += 1;
      const article = input.articles[index]!;
      await input.onProgress?.(article, index, total);
      enriched[index] = await enrichSingleArticle(provider, article, input.targetLanguage);
      flushChain = flushChain.then(async () => {
        while (flushIndex < total && enriched[flushIndex]) {
          const nextArticle = enriched[flushIndex]!;
          await input.onArticleEnriched?.(nextArticle, flushIndex, total);
          flushIndex += 1;
        }
      });
      await flushChain;
    }
  });

  await Promise.all(workers);

  for (let index = flushIndex; index < total; index += 1) {
    const nextArticle = enriched[index];
    if (!nextArticle) {
      continue;
    }

    await input.onArticleEnriched?.(nextArticle, index, total);
  }

  return enriched.filter((article): article is FeedArticle => Boolean(article));
}

async function enrichSingleArticle(provider: ReturnType<typeof createAiProvider>, article: FeedArticle, targetLanguage: string): Promise<FeedArticle> {
  try {
    const convertedSourceArticle = convertArticle(article);
    const withAi = await processArticleWithAi(provider, convertedSourceArticle, targetLanguage);
    return convertArticle(withAi);
  } catch {
    return convertArticle({
      ...article,
      title: articleText(article.title, ""),
      ...(article.summary != null ? { summary: articleText(article.summary, "") } : {})
    });
  }
}

export async function translatePreparedArticle(
  article: FeedArticle,
  ai: AiConfig,
  targetLanguage: string
): Promise<FeedArticle> {
  const provider = createAiProvider(ai);
  return enrichSingleArticle(provider, article, targetLanguage);
}

function resolveEnrichConcurrency(ai: AiConfig): number {
  return ai.provider === "local" ? LOCAL_ENRICH_CONCURRENCY : DEFAULT_ENRICH_CONCURRENCY;
}

function detectContentFormat(body: unknown): "html" | "markdown" | "plain-text" {
  if (typeof body !== "string") {
    return "plain-text";
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return "plain-text";
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return "html";
  }

  if (
    /^#{1,6}\s/m.test(trimmed)
    || /^[-*]\s+/m.test(trimmed)
    || /^\d+\.\s+/m.test(trimmed)
    || /```/.test(trimmed)
    || /!\[/.test(trimmed)
    || /\[[^\]]*\]\([^)]+\)/.test(trimmed)
  ) {
    return "markdown";
  }

  return "plain-text";
}
