import { useCallback, useEffect, useState } from "react";
import { fetchArticle, fetchFeed } from "../api/feed";
import type { Strings } from "../i18n/types";
import type { ChannelFilter, FeedArticle } from "../types/feed";
import { useAutoTranslateQueue } from "./useAutoTranslateQueue";

const PAGE_SIZE = 20;

type StreamingState = NonNullable<FeedArticle["translationStreaming"]>;

interface FeedState {
  channel: ChannelFilter;
  items: FeedArticle[];
  total: number;
  selectedId: string | null;
  selectedArticle: FeedArticle | null;
  search: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  isTranslating: boolean;
  translationError: string | null;
  hasMore: boolean;
  error: string | null;
  setChannel: (value: ChannelFilter) => void;
  setSearch: (value: string) => void;
  setSelectedId: (value: string | null) => void;
  loadNextPage: () => Promise<void>;
}

export function useFeedState(strings: Strings, language: string, enabled = true): FeedState {
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [items, setItems] = useState<FeedArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FeedArticle | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, FeedArticle>>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPage(offset: number): Promise<void> {
    const data = await fetchFeed(channel, language, { limit: PAGE_SIZE, offset });

    if (offset === 0) {
      setItems(data.items);
      setSelectedId(data.items[0]?.id ?? null);
      setDetailCache({});
    } else {
      setItems((current) => [...current, ...data.items]);
    }

    setTotal(data.total);
    setError(null);
  }

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setIsLoading(true);
      setIsLoadingMore(false);
      return () => {
        active = false;
      };
    }

    async function load(): Promise<void> {
      try {
        setIsLoading(true);
        setIsLoadingMore(false);
        const data = await fetchFeed(channel, language, { limit: PAGE_SIZE, offset: 0 });

        if (!active) {
          return;
        }

        setItems(data.items);
        setTotal(data.total);
        setDetailCache({});
        const nextId = data.items[0]?.id ?? null;
        setSelectedId(nextId);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : strings.loadFeedError);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [channel, enabled, language, strings.loadFeedError]);

  async function loadNextPage(): Promise<void> {
    if (isLoading || isLoadingMore || items.length >= total) {
      return;
    }

    setIsLoadingMore(true);

    try {
      await loadPage(items.length);
    } catch {
      setError(strings.loadFeedError);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const handleArticleTranslated = useCallback((translated: FeedArticle) => {
    setDetailCache((current) => ({ ...current, [translated.id]: translated }));
    setSelectedArticle((current) => {
      if (!current || current.id !== translated.id) {
        return current;
      }

      return translated;
    });
  }, []);

  const { activeTranslationId, streamingByArticleId, errorByArticleId } = useAutoTranslateQueue({
    items,
    selectedId,
    language,
    onArticleTranslated: handleArticleTranslated,
    enabled
  });

  useEffect(() => {
    let active = true;

    if (!selectedId) {
      setSelectedArticle(null);
      return () => {
        active = false;
      };
    }

    const currentId = selectedId;
    const cached = detailCache[currentId];
    if (cached) {
      setSelectedArticle(cached);
      return () => {
        active = false;
      };
    }

    const listArticle = items.find((item) => item.id === currentId) ?? null;
    if (listArticle) {
      setSelectedArticle((current) => (current?.id === currentId ? current : listArticle));
    }

    async function loadDetail(): Promise<void> {
      try {
        const detail = await fetchArticle(currentId, language);
        if (!active) {
          return;
        }

        setDetailCache((current) => ({ ...current, [currentId]: detail }));
        setSelectedArticle((current) => {
          if (current && current.id !== currentId) {
            return current;
          }

          return detail;
        });
      } catch {
        if (active) {
          setSelectedArticle((current) => (current?.id === currentId ? null : current));
        }
      }
    }

    void loadDetail();
    return () => {
      active = false;
    };
  }, [selectedId, language, items, detailCache]);

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return true;
    }

    return [item.title, item.summary ?? "", item.sourceName].some((value) =>
      value.toLowerCase().includes(keyword)
    );
  });

  useEffect(() => {
    if (filteredItems.length === 0) {
      if (selectedId !== null) {
        setSelectedId(null);
      }
      return;
    }

    const [firstFilteredItem] = filteredItems;
    if (!firstFilteredItem) {
      return;
    }

    if (!selectedId || !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(firstFilteredItem.id);
    }
  }, [filteredItems, selectedId]);

  const activeStreaming = selectedId ? streamingByArticleId[selectedId] : undefined;
  const displayedArticle = mergeStreamingIntoArticle(selectedArticle, selectedId, activeStreaming);
  const isTranslating = Boolean(selectedId && activeTranslationId === selectedId);
  const translationError = selectedId ? (errorByArticleId[selectedId] ?? null) : null;

  return {
    channel,
    items: filteredItems,
    total,
    selectedId,
    selectedArticle: displayedArticle,
    search,
    isLoading,
    isLoadingMore,
    isTranslating,
    translationError,
    hasMore: items.length < total,
    error,
    setChannel,
    setSearch,
    setSelectedId,
    loadNextPage
  };
}

function mergeStreamingIntoArticle(
  article: FeedArticle | null,
  selectedId: string | null,
  streaming: StreamingState | undefined
): FeedArticle | null {
  if (!article || !selectedId || article.id !== selectedId) {
    return article;
  }

  if (!streaming) {
    return article;
  }

  return { ...article, translationStreaming: streaming };
}
