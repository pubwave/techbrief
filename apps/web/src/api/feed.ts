import type { ChannelFilter, FeedArticle, FeedListResponse, FeedPageRequest } from "../types/feed";
import { fetchJson, resolveApiInput } from "./http";

export async function fetchFeed(
  channel: ChannelFilter,
  language: string,
  page: FeedPageRequest & { since?: string; search?: string }
): Promise<FeedListResponse> {
  const params = new URLSearchParams();
  if (channel !== "all") {
    params.set("category", channel);
  }
  params.set("language", language);
  params.set("limit", String(page.limit));
  params.set("offset", String(page.offset));
  if (page.since) {
    params.set("since", page.since);
  }
  if (page.search) {
    params.set("q", page.search);
  }
  return fetchJson<FeedListResponse>(`/v1/feed?${params.toString()}`);
}

export function streamFeedEvents(onUpdate: () => void): () => void {
  // Single reconnect chain with a tracked current source. The previous version
  // reconnected by re-calling streamFeedEvents() recursively, but the cleanup it
  // returned only closed the *first* EventSource — every reconnect leaked an
  // orphaned source that kept firing feed_updated, multiplying refetches.
  let closed = false;
  let current: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const connect = (): void => {
    if (closed) return;
    const events = new EventSource(resolveApiInput("/v1/feed/events"));
    current = events;

    events.addEventListener("feed_updated", () => {
      onUpdate();
    });

    events.onerror = () => {
      events.close();
      if (closed) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, 5_000);
    };
  };

  connect();

  return () => {
    closed = true;
    clearTimeout(retryTimer);
    current?.close();
  };
}

export async function fetchArticle(id: string, language: string): Promise<FeedArticle> {
  return fetchJson<FeedArticle>(`/v1/feed/${id}?language=${encodeURIComponent(language)}`);
}

export function streamArticleTranslation(
  id: string,
  language: string,
  handlers: {
    onStatus?: (status: string) => void;
    onPartial?: (payload: {
      translatedBodyMarkdown: string;
      translatedBodyNormalized: string;
      translatedBodyTiptapJson?: unknown;
      index: number;
      total: number;
    }) => void;
    onCompleted: (article: FeedArticle) => void;
    onError?: (message: string) => void;
  }
): () => void {
  const events = new EventSource(
    resolveApiInput(`/v1/feed/${id}/translate/stream?language=${encodeURIComponent(language)}`)
  );

  events.addEventListener("status", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as { status?: string };
    if (payload.status) {
      handlers.onStatus?.(payload.status);
    }
  });

  events.addEventListener("partial", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as {
      translatedBodyMarkdown: string;
      translatedBodyNormalized: string;
      translatedBodyTiptapJson?: unknown;
      index: number;
      total: number;
    };
    handlers.onPartial?.(payload);
  });

  events.addEventListener("completed", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as { article?: FeedArticle };
    if (payload.article) {
      handlers.onCompleted(payload.article);
    }
    events.close();
  });

  events.addEventListener("failed", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as { message?: string };
    handlers.onError?.(payload.message ?? "Unable to translate article.");
    events.close();
  });

  events.onerror = () => {
    handlers.onError?.("Unable to translate article.");
    events.close();
  };

  return () => {
    events.close();
  };
}
