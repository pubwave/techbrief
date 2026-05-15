import { useCallback, useEffect, useRef, useState } from "react";
import { streamArticleTranslation } from "../api/feed";
import type { FeedArticle } from "../types/feed";
import { createTranslationStreamingState, shouldRequestTranslation } from "./feed-translation";

type StreamingState = NonNullable<FeedArticle["translationStreaming"]>;

interface UseAutoTranslateQueueInput {
  items: FeedArticle[];
  selectedId: string | null;
  language: string;
  onArticleTranslated: (article: FeedArticle) => void;
  enabled?: boolean;
}

export interface AutoTranslateQueueState {
  activeTranslationId: string | null;
  streamingByArticleId: Record<string, StreamingState>;
  errorByArticleId: Record<string, string>;
}

export function useAutoTranslateQueue(input: UseAutoTranslateQueueInput): AutoTranslateQueueState {
  const { items, selectedId, language, onArticleTranslated, enabled = true } = input;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [streamingById, setStreamingById] = useState<Record<string, StreamingState>>({});
  const activeRef = useRef<{ id: string; stop: () => void } | null>(null);

  useEffect(() => {
    setActiveId(null);
    setCompletedIds(new Set());
    setErrorById({});
    setStreamingById({});
    activeRef.current?.stop();
    activeRef.current = null;
  }, [language]);

  const pickNextId = useCallback((): string | null => {
    if (selectedId && isTranslatableCandidate({
      articleId: selectedId,
      items,
      language,
      completedIds,
      errorById
    })) {
      return selectedId;
    }

    for (const item of items) {
      if (isTranslatableCandidate({
        articleId: item.id,
        items,
        language,
        completedIds,
        errorById
      })) {
        return item.id;
      }
    }

    return null;
  }, [items, selectedId, language, completedIds, errorById]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const current = activeRef.current;
    if (current) {
      const shouldInterrupt = selectedId !== null
        && selectedId !== current.id
        && !completedIds.has(selectedId)
        && !errorById[selectedId]
        && items.some((item) => item.id === selectedId);

      if (!shouldInterrupt) {
        return;
      }

      current.stop();
      activeRef.current = null;
    }

    const nextId = pickNextId();
    if (!nextId) {
      setActiveId(null);
      return;
    }

    const stop = streamArticleTranslation(nextId, language, {
      onPartial: (partial) => {
        setStreamingById((prev) => ({
          ...prev,
          [nextId]: createTranslationStreamingState(partial)
        }));
      },
      onCompleted: (article) => {
        activeRef.current = null;
        setStreamingById((prev) => removeKey(prev, nextId));
        setCompletedIds((prev) => addToSet(prev, nextId));
        setActiveId(null);
        onArticleTranslated(article);
      },
      onError: (message) => {
        activeRef.current = null;
        setStreamingById((prev) => removeKey(prev, nextId));
        setErrorById((prev) => ({ ...prev, [nextId]: message }));
        setActiveId(null);
      }
    });

    activeRef.current = { id: nextId, stop };
    setActiveId(nextId);

    return () => {
      if (activeRef.current?.stop === stop) {
        activeRef.current.stop();
        activeRef.current = null;
      }
    };
  }, [enabled, items, selectedId, language, completedIds, errorById, onArticleTranslated, pickNextId]);

  return {
    activeTranslationId: activeId,
    streamingByArticleId: streamingById,
    errorByArticleId: errorById
  };
}

function isTranslatableCandidate(input: {
  articleId: string;
  items: FeedArticle[];
  language: string;
  completedIds: Set<string>;
  errorById: Record<string, string>;
}): boolean {
  if (input.completedIds.has(input.articleId) || input.errorById[input.articleId]) {
    return false;
  }

  const article = input.items.find((item) => item.id === input.articleId);
  if (!article) {
    return false;
  }

  return shouldRequestTranslation(article, input.language);
}

function addToSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) {
    return set;
  }

  const next = new Set(set);
  next.add(value);
  return next;
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) {
    return record;
  }

  const { [key]: _removed, ...rest } = record;
  return rest;
}
