import { useAppRuntime } from "../app/AppRuntimeContext";
import type { Locale, Strings } from "../i18n/types";
import { useDetailScrollChrome } from "../hooks/useDetailScrollChrome";
import { useDetailScrollRelay } from "../hooks/useDetailScrollRelay";
import { formatRelativeTimestamp } from "../lib/format";
import { ui } from "../lib/ui";
import type { ThemeId } from "../theme/themes";
import type { FeedArticle } from "../types/feed";
import { ArticleDetailContent } from "./ArticleDetailContent";
import { DetailPaneSkeleton } from "./DetailPaneSkeleton";
import { SourceAvatar } from "./SourceAvatar";
import { TweaksPanel, type TweaksState } from "./TweaksPanel";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  ExternalLinkIcon,
} from "./icons/ReaderIcons";

interface DetailPaneProps {
  articleId: string | null;
  article: FeedArticle | null;
  canAdvanceToNext?: boolean;
  onAdvanceToNext?: (() => void) | undefined;
  prevArticle?: FeedArticle | null;
  nextArticle?: FeedArticle | null;
  onAdvanceToPrev?: (() => void) | undefined;
  locale: Locale;
  strings: Strings;
  theme: ThemeId;
  isLoading?: boolean;
  isTranslating?: boolean;
  translationError?: string | null;
  tweaks: TweaksState;
  onTweaksChange: (next: TweaksState) => void;
}

export function DetailPane({
  articleId,
  article,
  canAdvanceToNext = false,
  onAdvanceToNext,
  prevArticle = null,
  nextArticle = null,
  onAdvanceToPrev,
  locale,
  strings,
  theme,
  isLoading = false,
  isTranslating: _isTranslating = false,
  translationError = null,
  tweaks,
  onTweaksChange
}: DetailPaneProps) {
  const { isDesktop } = useAppRuntime();
  const { detailElement, detailRef, showAdvanceHint } = useDetailScrollRelay({
    articleId: articleId ?? undefined,
    canAdvanceToNext
  });
  const { progress, nearBottom } = useDetailScrollChrome({
    articleId: articleId ?? undefined,
    detailElement
  });

  if (!isDesktop) {
    if (isLoading) {
      return (
        <section
          className={`${ui.shell} tb-desktop-panel-max-height tb-scrollbar-hidden w-full px-[8px] py-[6px] md:overflow-y-auto md:px-[10px] md:py-[8px]`}
          ref={detailRef}
        >
          <DetailPaneSkeleton />
        </section>
      );
    }
    if (!article) {
      return (
        <section
          className={`${ui.shell} tb-desktop-panel-max-height tb-scrollbar-hidden w-full px-[18px] py-[16px]`}
          ref={detailRef}
        >
          {strings.selectArticle}
        </section>
      );
    }
    return (
      <section className={`${ui.shell} overflow-hidden`}>
        <article
          className="tb-desktop-panel-max-height tb-scrollbar-hidden w-full pb-[10px]"
          ref={detailRef}
        >
          <ArticleDetailContent
            article={article}
            locale={locale}
            strings={strings}
            theme={theme}
            topBar={
              translationError ? (
                <div className={`${ui.subtlePanel} px-3 py-2.5 text-red-400`}>{translationError}</div>
              ) : undefined
            }
          />
        </article>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-tb-surface-reader">
        <div className="h-[2px] shrink-0 bg-tb-border-subtle" />
        <div className="min-h-0 flex-1 overflow-y-auto px-10 py-10">
          <DetailPaneSkeleton />
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden bg-tb-surface-reader text-tb-text-deepest">
        <BookOpenIcon size={48} />
        <span className="text-[13px]">{strings.selectArticle}</span>
        <TweaksPanel onChange={onTweaksChange} strings={strings} value={tweaks} />
      </section>
    );
  }

  const relTime = formatRelativeTimestamp(article.publishedAt, locale);
  const readTime = estimateReadTime(article);

  return (
    <section className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-tb-surface-reader">
      <div className="h-[2px] shrink-0 bg-tb-border-subtle">
        <div
          aria-hidden
          className="h-full bg-tb-accent"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-[6px] border-b border-tb-border-subtle px-7 py-[11px]">
        <div className="flex min-w-0 flex-1 items-center gap-[6px]">
          <SourceAvatar size={22} source={article.sourceName} />
          <span className="truncate text-[13px] font-medium text-tb-text-secondary">{article.sourceName}</span>
          <span aria-hidden className="text-[12px] text-tb-border-strong">·</span>
          <span className="flex items-center gap-1 text-[13px] text-tb-text-muted">
            <ClockIcon size={12} />
            {relTime}
          </span>
          <span aria-hidden className="text-[12px] text-tb-border-strong">·</span>
          <span className="flex items-center gap-1 text-[13px] text-tb-text-muted">
            <BookOpenIcon size={12} />
            {readTime}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ToolbarButton
            label={strings.openSourceLink}
            onClick={() => {
              if (article.originalUrl) {
                window.open(article.originalUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <ExternalLinkIcon size={13} />
          </ToolbarButton>
        </div>
      </div>

      <article className="min-h-0 flex-1 overflow-y-auto" ref={detailRef}>
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: "min(1040px, 100%)",
            fontSize: `${tweaks.fontSize}px`,
            lineHeight: 1.85,
            paddingInline: "clamp(28px, 5vw, 72px)",
            paddingTop: "clamp(24px, 4vh, 40px)",
            paddingBottom: "clamp(24px, 4vh, 48px)"
          }}
        >
          {translationError ? (
            <div className="mb-4 rounded-xl border border-tb-border bg-tb-surface-subtle px-3 py-2.5 text-[12px] text-red-400">
              {translationError}
            </div>
          ) : null}
          <ArticleDetailContent article={article} locale={locale} strings={strings} theme={theme} />
          {prevArticle || nextArticle ? (
            <nav
              aria-label="Article navigation"
              className="mt-12 flex items-stretch gap-3 border-t border-tb-border pt-8"
              style={{
                opacity: nearBottom ? 1 : 0,
                transform: nearBottom ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
                pointerEvents: nearBottom ? "auto" : "none"
              }}
            >
              <div className="flex flex-1">
                {prevArticle && onAdvanceToPrev ? (
                  <PrevNextCard
                    article={prevArticle}
                    direction="prev"
                    label={strings.previousArticleLabel}
                    onClick={onAdvanceToPrev}
                  />
                ) : (
                  <div aria-hidden className="flex-1" />
                )}
              </div>
              <div className="flex flex-1">
                {nextArticle && onAdvanceToNext ? (
                  <PrevNextCard
                    article={nextArticle}
                    direction="next"
                    label={strings.nextArticleLabel}
                    onClick={onAdvanceToNext}
                  />
                ) : (
                  <div aria-hidden className="flex-1" />
                )}
              </div>
            </nav>
          ) : null}
        </div>
      </article>

      {showAdvanceHint && onAdvanceToNext && !nextArticle ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <button
            className="pointer-events-auto rounded-[10px] border border-tb-border-strong bg-tb-surface-subtle px-4 py-2 text-[13px] font-medium text-tb-text-secondary shadow-lg transition-colors hover:border-tb-accent hover:text-tb-accent"
            onClick={onAdvanceToNext}
            type="button"
          >
            {strings.detailContinueToNextArticle}
          </button>
        </div>
      ) : null}

      <TweaksPanel onChange={onTweaksChange} strings={strings} value={tweaks} />
    </section>
  );
}

interface ToolbarButtonProps {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className="group relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border border-tb-border-strong bg-transparent text-tb-text-subtle transition-colors hover:bg-tb-border hover:text-tb-text-primary"
      onClick={onClick}
      type="button"
    >
      {children}
      <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[8px] border border-tb-border-strong bg-tb-surface-shell px-2 py-1 text-[11px] font-medium text-tb-text-primary opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

interface PrevNextCardProps {
  article: FeedArticle;
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}

function PrevNextCard({ article, direction, label, onClick }: PrevNextCardProps) {
  const isNext = direction === "next";
  return (
    <button
      className="group flex w-full cursor-pointer flex-col gap-2 rounded-[10px] border border-tb-border bg-tb-surface-subtle p-4 text-left transition-colors hover:border-tb-accent hover:bg-tb-surface-card-hover"
      onClick={onClick}
      type="button"
    >
      <div
        className={[
          "flex items-center gap-[5px] text-[11px] uppercase tracking-[0.08em] text-tb-text-muted",
          isNext ? "justify-end" : "justify-start"
        ].join(" ")}
      >
        {isNext ? (
          <>
            {label}
            <ArrowRightIcon size={11} />
          </>
        ) : (
          <>
            <ArrowLeftIcon size={11} />
            {label}
          </>
        )}
      </div>
      <div
        className={[
          "flex items-center gap-2",
          isNext ? "flex-row-reverse" : "flex-row"
        ].join(" ")}
      >
        <SourceAvatar size={20} source={article.sourceName} />
        <span className="truncate text-[12px] text-tb-text-secondary">{article.sourceName}</span>
      </div>
      <div
        className={[
          "text-[13px] font-semibold leading-[1.4] text-tb-text-secondary",
          isNext ? "text-right" : "text-left"
        ].join(" ")}
      >
        {article.title}
      </div>
    </button>
  );
}

function estimateReadTime(article: FeedArticle): string {
  const text = article.bodyNormalized ?? article.summary ?? "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
}
