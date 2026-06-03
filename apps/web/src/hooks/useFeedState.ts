import { useCallback, useEffect, useRef, useState } from "react";
import { fetchArticle, fetchFeed, streamFeedEvents } from "../api/feed";
import type { Strings } from "../i18n/types";
import type { ChannelFilter, FeedArticle } from "../types/feed";
import { useAutoTranslateQueue } from "./useAutoTranslateQueue";

const PAGE_SIZE = 20;

type StreamingState = NonNullable<FeedArticle["translationStreaming"]>;

interface FeedState {
  channel: ChannelFilter;
  items: FeedArticle[];
  total: number;
  newCount: number;
  newIds: Set<string>;
  dismissNewCount: () => void;
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
  // Debounced search that actually drives the (global, server-side) query.
  const [committedSearch, setCommittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  // Ids of articles that have been merged into the list via the "+N New" badge
  // and haven't been opened yet, used to mark them "New" per-card. Populated on
  // flush (badge click), cleared per-card as each article is opened.
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const latestPublishedAtRef = useRef<string | null>(null);
  // The feed `total` (server count for the channel) the user has already seen.
  // newCount = total - seenTotal, so the badge is exact regardless of how many
  // new articles arrive at once — independent of any fetched window size.
  const seenTotalRef = useRef(0);
  const totalRef = useRef(0);
  useEffect(() => {
    totalRef.current = total;
  }, [total]);
  // Server rows consumed from the top via pagination (the base, server-ordered
  // segment). "+N New" prepends new articles out of server order, so loadMore
  // must page by this base count — not items.length — to avoid duplicates/gaps.
  // A dedupe on append guards overlaps caused by the shifted server ordering.
  const baseCountRef = useRef(0);
  const newCountRef = useRef(0);
  useEffect(() => {
    newCountRef.current = newCount;
  }, [newCount]);
  // Mirror of `items` so the (stable) incremental fetch can read the current
  // loaded set without being recreated on every list change.
  const itemsRef = useRef<FeedArticle[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Mirror committedSearch so the stable paginate/incremental closures fetch the
  // current search term without being recreated.
  const searchRef = useRef("");
  useEffect(() => {
    searchRef.current = committedSearch;
  }, [committedSearch]);

  // Mirror detailCache so the detail-load effect can short-circuit on a cache
  // hit without taking `detailCache` as a dependency. Depending on it (and on
  // `items`) made the effect re-run on every list refresh — e.g. each SSE
  // feed_updated push or translation — which re-fetched the open article and
  // flashed the detail pane back to its skeleton.
  const detailCacheRef = useRef<Record<string, FeedArticle>>({});
  useEffect(() => {
    detailCacheRef.current = detailCache;
  }, [detailCache]);

  // Debounce raw input → committed search (drives the server query + reload).
  useEffect(() => {
    const id = window.setTimeout(() => setCommittedSearch(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const fetchIncremental = useCallback(async (): Promise<void> => {
    const current = itemsRef.current;
    if (current.length === 0) {
      // Started empty (e.g. the page opened before the first sync populated the
      // DB). A plain incremental reconcile would bail, so do a fresh first-page
      // load so the list fills in when sync data arrives — no reload needed.
      try {
        const data = await fetchFeed(channel, language, { limit: PAGE_SIZE, offset: 0, search: searchRef.current });
        setItems(data.items);
        setTotal(data.total);
        seenTotalRef.current = data.total;
        baseCountRef.current = data.items.length;
        if (data.items.length > 0) {
          latestPublishedAtRef.current = data.items[0]?.publishedAt ?? null;
        }
      } catch {
        // ignore — the next sync push will retry
      }
      return;
    }
    // A push only updates the badge; the visible list is untouched until the
    // user taps "+N New". We just need the latest server total to compute the
    // exact unseen count (no window fetch / reconcile needed).
    try {
      const data = await fetchFeed(channel, language, { limit: PAGE_SIZE, offset: 0, search: searchRef.current });
      setTotal(data.total);
      setNewCount(Math.max(0, data.total - seenTotalRef.current));
    } catch {
      // ignore incremental errors
    }
  }, [channel, language]);

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
        const data = await fetchFeed(channel, language, { limit: PAGE_SIZE, offset: 0, search: committedSearch });

        if (!active) {
          return;
        }

        setItems(data.items);
        setTotal(data.total);
        seenTotalRef.current = data.total;
        baseCountRef.current = data.items.length;
        setDetailCache({});
        setNewCount(0);
        setNewIds(new Set());
        const nextId = data.items[0]?.id ?? null;
        setSelectedId(nextId);
        setError(null);
        latestPublishedAtRef.current = nextId ? (data.items[0]?.publishedAt ?? null) : null;
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
  }, [channel, enabled, language, committedSearch, strings.loadFeedError]);

  useEffect(() => {
    if (!enabled) return;
    const stop = streamFeedEvents(() => {
      void fetchIncremental();
    });
    return stop;
  }, [enabled, fetchIncremental]);

  async function loadNextPage(): Promise<void> {
    if (isLoading || isLoadingMore || baseCountRef.current >= total) {
      return;
    }

    setIsLoadingMore(true);

    try {
      // Page by the base count (server rows consumed from the top), not
      // items.length — pinned "New" articles sit out of server order and would
      // otherwise skew the offset. Dedupe on append: the server ordering shifts
      // as articles arrive, so a page can re-include something already shown.
      const data = await fetchFeed(channel, language, {
        limit: PAGE_SIZE,
        offset: baseCountRef.current,
        search: searchRef.current
      });
      baseCountRef.current += data.items.length;
      setItems((current) => {
        const have = new Set(current.map((article) => article.id));
        const additions = data.items.filter((article) => !have.has(article.id));
        return additions.length > 0 ? [...current, ...additions] : current;
      });
      setTotal(data.total);
    } catch {
      setError(strings.loadFeedError);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const handleArticleTranslated = useCallback((translated: FeedArticle) => {
    setItems((current) => current.map((item) => (item.id === translated.id ? translated : item)));
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
    const cached = detailCacheRef.current[currentId];
    if (cached) {
      setSelectedArticle(cached);
      return () => {
        active = false;
      };
    }

    const listArticle = itemsRef.current.find((item) => item.id === currentId) ?? null;
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
    // Reads `items`/`detailCache` via refs so list refreshes (SSE, translation)
    // don't re-trigger a detail fetch; the open article is fetched once per
    // selection/language. Translations update `selectedArticle` directly via
    // handleArticleTranslated, so this effect doesn't need to observe them.
  }, [selectedId, language]);

  // Search is now global (server-side via committedSearch), so `items` already
  // contains the filtered results; no client-side filtering needed.
  const filteredItems = items;

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

  // Click the "+N New" badge: fetch from the top deep enough to cover every new
  // article (above the loaded base depth) in server order, then pin the ones not
  // already shown to the top, mark them "New" per-card, and clear the count.
  // baseCount is left untouched (these are prepended, not consumed base pages),
  // so pagination stays consistent. The caller also scrolls the list to top.
  const dismissNewCount = useCallback(async () => {
    if (newCountRef.current <= 0) {
      setNewCount(0);
      return;
    }

    const current = itemsRef.current;
    try {
      const limit = Math.max(PAGE_SIZE, baseCountRef.current + newCountRef.current);
      const data = await fetchFeed(channel, language, { limit, offset: 0, search: searchRef.current });
      const have = new Set(current.map((article) => article.id));
      const arrived = data.items.filter((article) => !have.has(article.id));
      if (arrived.length > 0) {
        setItems([...arrived, ...current]);
        setNewIds((prev) => {
          const next = new Set(prev);
          for (const article of arrived) next.add(article.id);
          return next;
        });
      }
      setTotal(data.total);
      seenTotalRef.current = data.total;
    } catch {
      // On failure just acknowledge the badge; a later push/reload reconciles.
      seenTotalRef.current = totalRef.current;
    }
    setNewCount(0);
  }, [channel, language]);

  // Opening an article marks it read, removing its per-card "New" marker. Used
  // for the exposed selection so programmatic auto-selection doesn't clear it.
  const selectArticle = useCallback((value: string | null) => {
    setSelectedId(value);
    if (value) {
      setNewIds((prev) => {
        if (!prev.has(value)) return prev;
        const next = new Set(prev);
        next.delete(value);
        return next;
      });
    }
  }, []);

  return {
    channel,
    items: filteredItems,
    total,
    newCount,
    newIds,
    dismissNewCount,
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
    setSelectedId: selectArticle,
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
