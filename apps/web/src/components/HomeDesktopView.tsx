import { useRef } from "react";
import type { Locale, Strings } from "../i18n/types";
import { useDesktopBodyScrollLock } from "../hooks/useDesktopBodyScrollLock";
import { useScrollSelectedArticle } from "../hooks/useScrollSelectedArticle";
import { useTweaks } from "../hooks/useTweaks";
import type { ThemeId } from "../theme/themes";
import type { ChannelFilter, FeedArticle } from "../types/feed";
import { DetailPane } from "./DetailPane";
import { DesktopFeedPane } from "./DesktopFeedPane";

interface HomeDesktopViewProps {
  article: FeedArticle | null;
  channel: ChannelFilter;
  strings: Strings;
  items: FeedArticle[];
  total: number;
  newCount?: number;
  newIds?: Set<string>;
  onDismissNew?: () => void;
  locale: Locale;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onChannelChange: (value: ChannelFilter) => void;
  onLoadMore?: (() => Promise<void> | void) | undefined;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  search: string;
  selectedId: string | null;
  isLoading?: boolean;
  isTranslating?: boolean;
  translationError?: string | null;
  theme: ThemeId;
}

export function HomeDesktopView({
  article,
  channel,
  strings,
  items,
  total,
  newCount = 0,
  newIds,
  onDismissNew,
  locale,
  hasMore = false,
  isLoadingMore = false,
  onChannelChange,
  onLoadMore,
  onSearchChange,
  onSelect,
  search,
  selectedId,
  isLoading = false,
  isTranslating = false,
  translationError = null,
  theme
}: HomeDesktopViewProps) {
  useDesktopBodyScrollLock();
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const { tweaks, setTweaks } = useTweaks();
  const { advanceToArticle, setArticleElement, setScrollContainer, selectArticle } =
    useScrollSelectedArticle(onSelect);
  const selectedIndex = selectedId ? items.findIndex((item) => item.id === selectedId) : -1;
  const nextArticle = selectedIndex >= 0 ? (items[selectedIndex + 1] ?? null) : null;
  const prevArticle = selectedIndex > 0 ? (items[selectedIndex - 1] ?? null) : null;

  function getArticleRef(id: string) {
    return (element: HTMLDivElement | null) => {
      setArticleElement(id, element);
    };
  }

  function handleListScrollContainer(element: HTMLDivElement | null) {
    listScrollRef.current = element;
    setScrollContainer(element);
  }

  return (
    <div className="flex min-w-0 flex-1">
      <DesktopFeedPane
        cardStyle={tweaks.cardStyle}
        channel={channel}
        getArticleRef={getArticleRef}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        items={items}
        listScrollRef={listScrollRef}
        listWidth={tweaks.listWidth}
        locale={locale}
        onChannelChange={onChannelChange}
        onListScrollContainerChange={handleListScrollContainer}
        onLoadMore={onLoadMore}
        onSearchChange={onSearchChange}
        onSelect={selectArticle}
        search={search}
        selectedId={selectedId}
        strings={strings}
        total={total}
        newCount={newCount}
        newIds={newIds}
        onDismissNew={onDismissNew}
      />
      <DetailPane
        article={article}
        articleId={selectedId}
        canAdvanceToNext={Boolean(nextArticle)}
        isLoading={isLoading}
        isTranslating={isTranslating}
        locale={locale}
        nextArticle={nextArticle}
        onAdvanceToNext={nextArticle ? () => advanceToArticle(nextArticle.id) : undefined}
        onAdvanceToPrev={prevArticle ? () => advanceToArticle(prevArticle.id) : undefined}
        onTweaksChange={setTweaks}
        prevArticle={prevArticle}
        strings={strings}
        theme={theme}
        translationError={translationError}
        tweaks={tweaks}
      />
    </div>
  );
}
