import { useCallback, useEffect, useRef, useState } from "react";
import { streamArticleTranslation } from "../api/feed";
import type { FeedArticle } from "../types/feed";
import { createTranslationStreamingState, shouldRequestTranslation } from "./feed-translation";

type StreamingState = NonNullable<FeedArticle["translationStreaming"]>;

const MAX_CONCURRENT_STREAMS = 3;

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
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [streamingById, setStreamingById] = useState<Record<string, StreamingState>>({});
  const activeStreamsRef = useRef<Map<string, () => void>>(new Map());

  const errorByIdRef = useRef(errorById);
  errorByIdRef.current = errorById;

  // Reset state when language changes
  useEffect(() => {
    for (const stop of activeStreamsRef.current.values()) stop();
    activeStreamsRef.current.clear();
    setActiveIds(new Set());
    setCompletedIds(new Set());
    setErrorById({});
    setStreamingById({});
  }, [language]);

  // Stop all streams on unmount
  useEffect(() => {
    const activeStreams = activeStreamsRef.current;
    return () => {
      for (const stop of activeStreams.values()) stop();
      activeStreams.clear();
    };
  }, []);

  // When the user selects a different article, clear its error so it can retry.
  useEffect(() => {
    if (selectedId && errorByIdRef.current[selectedId]) {
      setErrorById((prev) => {
        if (!prev[selectedId]) {
          return prev;
        }

        const { [selectedId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  // errorByIdRef is a ref - intentionally omitted from deps so this only fires
  // when selectedId changes, not when an error is recorded.
  }, [selectedId]);

  const pickNextIds = useCallback((): string[] => {
    const results: string[] = [];

    if (selectedId && isTranslatableCandidate({ articleId: selectedId, items, language, completedIds, errorById })) {
      results.push(selectedId);
    }

    for (const item of items) {
      if (results.length >= MAX_CONCURRENT_STREAMS) break;
      if (item.id === selectedId) continue;
      if (isTranslatableCandidate({ articleId: item.id, items, language, completedIds, errorById })) {
        results.push(item.id);
      }
    }

    return results;
  }, [items, selectedId, language, completedIds, errorById]);

  useEffect(() => {
    if (!enabled) {
      for (const stop of activeStreamsRef.current.values()) stop();
      activeStreamsRef.current.clear();
      setActiveIds(new Set());
      return;
    }

    const nextIds = new Set(pickNextIds());
    const current = activeStreamsRef.current;

    // Stop streams that are no longer needed
    for (const [id, stop] of [...current.entries()]) {
      if (!nextIds.has(id)) {
        stop();
        current.delete(id);
      }
    }

    // Start streams for new candidates
    for (const id of nextIds) {
      if (current.has(id)) continue;

      const stop = streamArticleTranslation(id, language, {
        onPartial: (partial) => {
          setStreamingById((prev) => ({
            ...prev,
            [id]: createTranslationStreamingState(partial)
          }));
        },
        onCompleted: (article) => {
          activeStreamsRef.current.delete(id);
          setStreamingById((prev) => removeKey(prev, id));
          setCompletedIds((prev) => addToSet(prev, id));
          setActiveIds((prev) => removeFromSet(prev, id));
          onArticleTranslated(article);
        },
        onError: (message) => {
          activeStreamsRef.current.delete(id);
          setStreamingById((prev) => removeKey(prev, id));
          setErrorById((prev) => ({ ...prev, [id]: message }));
          setActiveIds((prev) => removeFromSet(prev, id));
        }
      });

      current.set(id, stop);
    }

    setActiveIds(new Set(current.keys()));
  }, [enabled, items, selectedId, language, completedIds, errorById, onArticleTranslated, pickNextIds]);

  return {
    activeTranslationId: selectedId && activeIds.has(selectedId) ? selectedId : null,
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

function removeFromSet<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) {
    return set;
  }

  const next = new Set(set);
  next.delete(value);
  return next;
}

function removeKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) {
    return record;
  }

  const { [key]: _removed, ...rest } = record;
  return rest;
}
