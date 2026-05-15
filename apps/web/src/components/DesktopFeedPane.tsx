import { useEffect, useState } from "react";
import type { Locale, Strings } from "../i18n/types";
import { useInfiniteScrollSentinel } from "../hooks/useInfiniteScrollSentinel";
import { getChannelLabel } from "../lib/format";
import type { ChannelFilter, FeedArticle } from "../types/feed";
import { ArticleCard } from "./ArticleCard";
import { FeedPaneSkeleton } from "./FeedPaneSkeleton";
import type { CardStyle } from "./TweaksPanel";
import { SearchIcon } from "./icons/ReaderIcons";

interface DesktopFeedPaneProps {
  getArticleRef: (id: string) => (element: HTMLDivElement | null) => void;
  items: FeedArticle[];
  listScrollRef: React.RefObject<HTMLDivElement | null>;
  total: number;
  search: string;
  channel: ChannelFilter;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  selectedId: string | null;
  onChannelChange: (value: ChannelFilter) => void;
  onListScrollContainerChange: (element: HTMLDivElement | null) => void;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onLoadMore?: (() => Promise<void> | void) | undefined;
  locale: Locale;
  strings: Strings;
  isLoading?: boolean;
  listWidth?: number;
  cardStyle?: CardStyle;
}

const CHANNELS: ChannelFilter[] = ["all", "tech-news", "indie-dev"];

export function DesktopFeedPane({
  getArticleRef,
  items,
  listScrollRef,
  total,
  search,
  channel,
  hasMore = false,
  isLoadingMore = false,
  selectedId,
  onChannelChange,
  onListScrollContainerChange,
  onSearchChange,
  onSelect,
  onLoadMore,
  locale,
  strings,
  isLoading = false,
  listWidth = 350,
  cardStyle = "compact"
}: DesktopFeedPaneProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const bottomSentinelRef = useInfiniteScrollSentinel({
    disabled: isLoading || isLoadingMore || !hasMore || !onLoadMore,
    rootRef: listScrollRef,
    onReachEnd: () => {
      void onLoadMore?.();
    }
  });

  useEffect(() => {
    // no-op: placeholder for future focus/keyboard shortcuts
  }, []);

  return (
    <aside
      aria-label={strings.menu}
      className="flex h-screen shrink-0 flex-col border-r border-tb-border-subtle bg-tb-surface-shell"
      style={{ width: `${listWidth}px` }}
    >
      <header className="shrink-0 border-b border-tb-border-subtle px-[18px] pt-[14px] pb-[10px]">
        <div className="mb-[10px] flex items-center">
          <span className="flex-1 text-[13px] font-bold tracking-[-0.01em] text-tb-text-primary">
            Tech Brief
          </span>
          <span className="rounded-[10px] bg-tb-surface-button px-[9px] py-[3px] text-[12px] font-medium text-tb-text-muted">
            {strings.itemsCount(total)}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-tb-text-muted">
            {strings.channel}
          </span>
          {CHANNELS.map((item) => {
            const active = channel === item;
            return (
              <button
                key={item}
                className={[
                  "cursor-pointer rounded-[7px] border-0 px-3 py-[5px] text-[12px] font-medium transition-colors duration-100",
                  active
                    ? "bg-tb-accent text-tb-accent-ink"
                    : "bg-tb-surface-button text-tb-text-subtle hover:bg-tb-surface-card-hover hover:text-tb-text-secondary"
                ].join(" ")}
                onClick={() => onChannelChange(item)}
                type="button"
              >
                {getChannelLabel(item, strings)}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-tb-text-faint">
            <SearchIcon size={14} />
          </span>
          <input
            className={[
              "w-full rounded-[8px] border bg-tb-surface-input py-2 pl-[30px] pr-3 text-[12px] text-tb-text-primary outline-none transition-colors",
              searchFocused ? "border-tb-accent" : "border-tb-border"
            ].join(" ")}
            onBlur={() => setSearchFocused(false)}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder={strings.searchPlaceholder}
            type="search"
            value={search}
          />
        </div>
      </header>

      <div className="flex shrink-0 items-center justify-between px-[18px] py-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-tb-text-muted">
          {strings.sortHint}
        </span>
        <span className="text-[11px] font-medium text-tb-text-muted">
          {strings.itemsCount(items.length)}
        </span>
      </div>

      <div
        className="tb-scrollbar-hidden min-h-0 flex-1 overflow-y-auto"
        ref={onListScrollContainerChange}
      >
        {isLoading ? (
          <div className="px-[14px] pt-2 pb-4">
            <FeedPaneSkeleton />
          </div>
        ) : items.length === 0 ? (
          <div className="px-8 py-10 text-center text-[13px] text-tb-text-deepest">
            {search.trim() ? strings.emptySearchResults : strings.emptyFeed}
          </div>
        ) : (
          <div className={cardStyle === "magazine" ? "px-[10px] pt-[4px]" : ""}>
            {items.map((article) => (
              <div key={article.id} ref={getArticleRef(article.id)}>
                <ArticleCard
                  article={article}
                  cardStyle={cardStyle}
                  locale={locale}
                  onSelect={onSelect}
                  selected={article.id === selectedId}
                  strings={strings}
                />
              </div>
            ))}
          </div>
        )}
        {hasMore ? <div aria-hidden="true" className="h-6 w-full" ref={bottomSentinelRef} /> : null}
        {isLoadingMore ? (
          <div className="py-3 text-center text-[12px] text-tb-text-subtle">
            {strings.loadingMore}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
