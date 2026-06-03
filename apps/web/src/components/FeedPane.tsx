import { useRef } from "react";
import type { Locale, Strings } from "../i18n/types";
import { ArticleCard } from "./ArticleCard";
import { FeedPaneSkeleton } from "./FeedPaneSkeleton";
import { SyncStatusBar } from "./SyncStatusBar";
import { ui } from "../lib/ui";
import type { FeedArticle } from "../types/feed";

interface FeedPaneProps {
  items: FeedArticle[];
  total: number;
  newCount?: number;
  newIds?: Set<string> | undefined;
  onDismissNew?: (() => void) | undefined;
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
  newCount = 0,
  newIds,
  onDismissNew,
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const setScrollEl = (element: HTMLDivElement | null) => {
    scrollRef.current = element;
    listScrollRef?.(element);
  };

  return (
    <aside className={`${ui.shell} flex flex-col gap-3 p-[14px] md:h-full md:min-h-0 md:overflow-hidden`}>
      <div className={`flex items-center justify-between gap-3 ${ui.mutedMeta}`}>
        <span className="uppercase tracking-[0.04em]">{strings.sortHint}</span>
        <div className="flex items-center gap-2">
          <span className="text-tb-accent">{strings.itemsCount(total)}</span>
          {newCount > 0 && (
            <NewBadge
              count={newCount}
              onClick={() => {
                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                onDismissNew?.();
              }}
            />
          )}
        </div>
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

      <SyncStatusBar strings={strings} />
      <div className="tb-scrollbar-hidden pb-[14px] md:min-h-0 md:flex-1 md:overflow-y-auto" ref={setScrollEl}>
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
                  isNew={newIds?.has(article.id) ?? false}
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

function NewBadge({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="animate-pulse cursor-pointer rounded-full border border-tb-accent px-1.5 py-0.5 text-[10px] font-bold text-tb-accent transition-colors hover:bg-tb-accent/10"
    >
      +{count} New
    </button>
  );
}
