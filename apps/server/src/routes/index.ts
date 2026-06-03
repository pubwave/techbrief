import type { RequestContext } from "../http.js";
import { sendJson, sendNoContent } from "../http.js";
import { HttpError } from "../http-error.js";
import { handleConfigRoute } from "./config.js";
import { handleFeedDetailRoute } from "./feed/detail.js";
import { handleFeedEventsRoute } from "./feed/events.js";
import { handleFeedListRoute } from "./feed/list.js";
import { handleFeedTranslationStreamRoute } from "./feed/translation-stream.js";
import { handleSyncRoute } from "./feed/sync.js";
import { handleLanguagesRoute } from "./languages.js";
import { handleModelsRoute } from "./models.js";
import { handleScheduleRoute } from "./schedule.js";
import { handleSourcesRoute } from "./sources.js";

export async function handleRoute(context: RequestContext): Promise<void> {
  const { request, response, url } = context;

  if (request.method === "OPTIONS") {
    sendNoContent(response);
    return;
  }

  if (url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  try {
    switch (url.pathname) {
      case "/v1/feed":
        await handleFeedListRoute(context);
        return;
      case "/v1/feed/events":
        await handleFeedEventsRoute(context);
        return;
      case "/v1/sync":
        await handleSyncRoute(context);
        return;
      case "/v1/languages":
        handleLanguagesRoute(context);
        return;
      case "/v1/models":
        await handleModelsRoute(context);
        return;
      case "/v1/config":
        await handleConfigRoute(context);
        return;
      case "/v1/schedule":
        await handleScheduleRoute(context);
        return;
      case "/v1/sources":
      case "/v1/sources/validate":
        await handleSourcesRoute(context);
        return;
      default:
        if (url.pathname.startsWith("/v1/feed/") && url.pathname.endsWith("/translate/stream")) {
          await handleFeedTranslationStreamRoute(context);
          return;
        }

        if (url.pathname.startsWith("/v1/feed/")) {
          await handleFeedDetailRoute(context);
          return;
        }

        if (url.pathname.startsWith("/v1/sources/")) {
          await handleSourcesRoute(context);
          return;
        }

        sendJson(response, 404, { error: `Route '${url.pathname}' was not found.` });
    }
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.statusCode, { error: error.message });
    } else {
      // Unknown failure (DB/AI/programming error) — a real 500, not a disguised
      // 400. Log server-side; return a generic message to the client.
      console.error(`Unhandled error on ${request.method} ${url.pathname}:`, error);
      sendJson(response, 500, { error: "Internal server error." });
    }
  }

  if (!response.writableEnded) {
    sendJson(response, 500, { error: `Request '${request.method} ${url.pathname}' was not completed.` });
  }
}
