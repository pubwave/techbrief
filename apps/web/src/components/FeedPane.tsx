import type { Locale, Strings } from "../i18n/types";
import { ArticleCard } from "./ArticleCard";
import { FeedPaneSkeleton } from "./FeedPaneSkeleton";
import { ui } from "../lib/ui";
import type { FeedArticle } from "../types/feed";

interface FeedPaneProps {
  items: FeedArticle[];
  total: number;
  search: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  selectedId: string | null;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  locale: Locale;
  strings: Strings;
  isLoading?: boolean;
  getArticleRef?: (id: string) => (element: HTMLDivElement | null) => void;
  bottomSentinelRef?: React.RefObject<HTMLDivElement | null>;
  listScrollRef?: (element: HTMLDivElement | null) => void;
}

export function FeedPane({
  items,
  total,
  search,
  hasMore = false,
  isLoadingMore = false,
  selectedId,
  onSearchChange,
  onSelect,
  locale,
  strings,
  isLoading = false,
  getArticleRef,
  bottomSentinelRef,
  listScrollRef
}: FeedPaneProps) {
  return (
    <aside className={`${ui.shell} flex flex-col gap-3 p-[14px] md:h-full md:min-h-0 md:overflow-hidden`}>
      <div className={`flex justify-between gap-3 ${ui.mutedMeta}`}>
        <span className="text-tb-accent">{strings.itemsCount(total)}</span>
        <span>{strings.sortHint}</span>
      </div>
      <label className={`${ui.inputShell} flex items-center gap-3 px-[14px] py-3`}>
        <input
          className="w-full border-0 bg-transparent text-tb-text-primary outline-none"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={strings.searchPlaceholder}
          type="search"
          value={search}
        />
      </label>
      <div className="tb-scrollbar-hidden pb-[14px] md:min-h-0 md:flex-1 md:overflow-y-auto" ref={listScrollRef}>
        {isLoading ? (
          <FeedPaneSkeleton />
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-tb-text-muted">
            {search.trim() ? strings.emptySearchResults : strings.emptyFeed}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((article) => (
              <div key={article.id} ref={getArticleRef?.(article.id)}>
                <ArticleCard
                  article={article}
                  locale={locale}
                  onSelect={onSelect}
                  selected={article.id === selectedId}
                  strings={strings}
                />
              </div>
            ))}
          </div>
        )}
        {hasMore ? <div ref={bottomSentinelRef} className="h-6 w-full" aria-hidden="true" /> : null}
        {isLoadingMore ? (
          <div className="text-center text-sm text-tb-text-secondary">{strings.loadingMore}</div>
        ) : null}
      </div>
    </aside>
  );
}
