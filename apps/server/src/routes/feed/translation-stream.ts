import { requiresAiForLanguage, type FeedArticle } from "@techbrief/shared";
import { getArticleById } from "../../db/articles.js";
import type { RequestContext } from "../../http.js";
import { openSseStream, sendJson, sendSseEvent } from "../../http.js";
import { attachArticleTranslationJob } from "../../services/feed-translation-jobs.js";

function parseArticleId(pathname: string): string | null {
  const match = pathname.match(/^\/v1\/feed\/([^/]+)\/translate\/stream$/);
  return match?.[1] ?? null;
}

export async function handleFeedTranslationStreamRoute({ request, response, url }: RequestContext): Promise<void> {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const articleId = parseArticleId(url.pathname);
  const targetLanguage = url.searchParams.get("language");
  if (!articleId || !targetLanguage) {
    sendJson(response, 400, { error: "Article id and language are required." });
    return;
  }

  const article = await getArticleById(articleId, targetLanguage);
  if (!article) {
    sendJson(response, 404, { error: "Article was not found." });
    return;
  }

  openSseStream(response);
  let streamClosed = false;
  const heartbeat = setInterval(() => {
    if (streamClosed || response.destroyed || response.writableEnded) {
      return;
    }

    response.write(": ping\n\n");
  }, 15000);
  const closeStream = () => {
    streamClosed = true;
    clearInterval(heartbeat);
  };
  request.on("close", closeStream);
  response.on("close", closeStream);

  if (!requiresAiForLanguage(targetLanguage) || hasTranslatedArticle(article)) {
    sendEventIfOpen(response, streamClosed, "completed", { article });
    endIfOpen(response, streamClosed);
    return;
  }

  try {
    const job = await attachArticleTranslationJob({
      articleId,
      targetLanguage,
      onStatus: async (status) => {
        sendEventIfOpen(response, streamClosed, "status", { status });
      },
      onPartialBody: async (partial) => {
        sendEventIfOpen(response, streamClosed, "partial", partial);
      }
    });
    const detach = () => {
      closeStream();
      job.detach();
    };
    request.on("close", detach);
    response.on("close", detach);

    const translatedArticle = await job.promise;
    sendEventIfOpen(response, streamClosed, "completed", { article: translatedArticle });
    endIfOpen(response, streamClosed);
  } catch (error) {
    sendEventIfOpen(response, streamClosed, "failed", {
      message: error instanceof Error ? error.message : "Article translation failed."
    });
    endIfOpen(response, streamClosed);
  }
}

function hasTranslatedArticle(article: FeedArticle): boolean {
  return Boolean(article.translatedBodyRaw?.trim()) && Boolean(article.translatedTitle?.trim());
}

function sendEventIfOpen(
  response: RequestContext["response"],
  streamClosed: boolean,
  event: string,
  payload: unknown
): void {
  if (streamClosed || response.destroyed || response.writableEnded) {
    return;
  }

  sendSseEvent(response, event, payload);
}

function endIfOpen(response: RequestContext["response"], streamClosed: boolean): void {
  if (streamClosed || response.destroyed || response.writableEnded) {
    return;
  }

  response.end();
}
