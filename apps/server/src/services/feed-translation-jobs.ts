import { translateStoredArticle } from "@techbrief/feed";
import { loadConfig } from "@techbrief/runtime";
import type { FeedArticle } from "@techbrief/shared";
import { enqueueTranslationTask, setTranslationQueueConcurrency } from "./translation-queue.js";

type TranslationStatus = "queued" | "loading" | "processing" | "saving" | "completed";
type TranslationPartial = {
  translatedBodyMarkdown: string;
  translatedBodyNormalized: string;
  translatedBodyTiptapJson: unknown;
  index: number;
  total: number;
};

interface TranslationJobListener {
  onStatus?: (status: TranslationStatus) => Promise<void> | void;
  onPartialBody?: (input: TranslationPartial) => Promise<void> | void;
}

interface TranslationJobState {
  promise: Promise<FeedArticle>;
  listeners: Set<TranslationJobListener>;
  status: TranslationStatus;
  latestPartial: TranslationPartial | null;
}

const translationJobs = new Map<string, TranslationJobState>();

export interface TranslationJobHandle {
  promise: Promise<FeedArticle>;
  detach: () => void;
}

export async function attachArticleTranslationJob(input: {
  articleId: string;
  targetLanguage: string;
  onStatus?: (status: TranslationStatus) => Promise<void> | void;
  onPartialBody?: (input: TranslationPartial) => Promise<void> | void;
}): Promise<TranslationJobHandle> {
  const key = `${input.articleId}:${input.targetLanguage}`;
  const existing = translationJobs.get(key);
  const listener: TranslationJobListener = {
    ...(input.onStatus ? { onStatus: input.onStatus } : {}),
    ...(input.onPartialBody ? { onPartialBody: input.onPartialBody } : {})
  };
  const detach = () => {
    const state = translationJobs.get(key);
    state?.listeners.delete(listener);
  };

  if (existing) {
    existing.listeners.add(listener);
    await notifyListener(listener, existing, "status", existing.status);
    if (existing.latestPartial) {
      await notifyListener(listener, existing, "partial", existing.latestPartial);
    }

    return {
      promise: existing.promise,
      detach
    };
  }

  const listeners = new Set<TranslationJobListener>([listener]);
  const notifyStatus = async (status: TranslationStatus): Promise<void> => {
    const state = translationJobs.get(key);
    if (state) {
      state.status = status;
    }

    await Promise.all(Array.from(listeners, (currentListener) =>
      notifyListener(currentListener, state, "status", status)
    ));
  };
  const notifyPartial = async (partial: TranslationPartial): Promise<void> => {
    const state = translationJobs.get(key);
    if (state) {
      state.latestPartial = partial;
    }

    await Promise.all(Array.from(listeners, (currentListener) =>
      notifyListener(currentListener, state, "partial", partial)
    ));
  };

  await configureTranslationQueue();
  const promise = enqueueTranslationTask(async () => {
    const result = await translateStoredArticle({
      articleId: input.articleId,
      targetLanguage: input.targetLanguage,
      onStatus: notifyStatus,
      onPartialBody: notifyPartial
    });

    if (!result.ok || !result.article) {
      throw new Error(result.error ?? "Article translation failed.");
    }

    return result.article;
  }).finally(() => {
    translationJobs.delete(key);
  });

  translationJobs.set(key, {
    promise,
    listeners,
    status: "queued",
    latestPartial: null
  });

  return {
    promise,
    detach
  };
}

async function notifyListener(
  listener: TranslationJobListener,
  state: TranslationJobState | undefined,
  kind: "status" | "partial",
  payload: TranslationStatus | TranslationPartial
): Promise<void> {
  try {
    if (kind === "status") {
      await listener.onStatus?.(payload as TranslationStatus);
      return;
    }

    await listener.onPartialBody?.(payload as TranslationPartial);
  } catch {
    state?.listeners.delete(listener);
  }
}

async function configureTranslationQueue(): Promise<void> {
  const config = await loadConfig();
  setTranslationQueueConcurrency(resolveQueueConcurrency(config.ai));
}

function resolveQueueConcurrency(ai: { modelSource: string; provider: string }): number {
  if (ai.modelSource === "local" || ai.provider === "local") {
    return 2;
  }

  return 2;
}
