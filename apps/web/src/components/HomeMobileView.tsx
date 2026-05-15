import { useEffect } from "react";
import type { Locale, Strings } from "../i18n/types";
import { useInfiniteScrollSentinel } from "../hooks/useInfiniteScrollSentinel";
import type { ThemeId } from "../theme/themes";
import type { FeedArticle } from "../types/feed";
import { FeedPane } from "./FeedPane";
import { MobileArticleDetailPage } from "./MobileArticleDetailPage";

export type MobileHomeScreen = "list" | "detail";

interface HomeMobileViewProps {
  article: FeedArticle | null;
  strings: Strings;
  items: FeedArticle[];
  total: number;
  locale: Locale;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onBackToList: () => void;
  onLoadMore?: (() => Promise<void> | void) | undefined;
  onOpenDetail: (id: string) => void;
  onSearchChange: (value: string) => void;
  screen: MobileHomeScreen;
  search: string;
  selectedId: string | null;
  isTranslating?: boolean;
  translationError?: string | null;
  theme: ThemeId;
}

export function HomeMobileView({
  article,
  strings,
  items,
  total,
  locale,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  onBackToList,
  onLoadMore,
  onOpenDetail,
  onSearchChange,
  screen,
  search,
  selectedId,
  isTranslating = false,
  translationError = null,
  theme
}: HomeMobileViewProps) {
  const bottomSentinelRef = useInfiniteScrollSentinel({
    disabled: isLoading || isLoadingMore || !hasMore || !onLoadMore,
    onReachEnd: () => {
      void onLoadMore?.();
    }
  });

  useEffect(() => {
    const firstItem = items[0];
    if (screen === "detail" && !selectedId && firstItem) {
      onOpenDetail(firstItem.id);
    }
  }, [items, onOpenDetail, screen, selectedId]);

  if (screen === "detail") {
    return (
      <MobileArticleDetailPage
        article={article}
        locale={locale}
        onBack={onBackToList}
        strings={strings}
        theme={theme}
        isTranslating={isTranslating}
        translationError={translationError}
      />
    );
  }

  return (
    <FeedPane
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      strings={strings}
      items={items}
      total={total}
      locale={locale}
      onSelect={onOpenDetail}
      onSearchChange={onSearchChange}
      search={search}
      selectedId={selectedId}
      bottomSentinelRef={bottomSentinelRef}
    />
  );
}
