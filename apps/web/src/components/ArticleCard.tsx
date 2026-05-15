import type { Locale, Strings } from "../i18n/types";
import { formatRelativeTimestamp, getArticleTagLabels } from "../lib/format";
import type { FeedArticle } from "../types/feed";
import type { CardStyle } from "./TweaksPanel";
import { BookOpenIcon, ClockIcon } from "./icons/ReaderIcons";
import { SourceAvatar, getSourceColor } from "./SourceAvatar";

interface ArticleCardProps {
  article: FeedArticle;
  selected: boolean;
  onSelect: (id: string) => void;
  locale: Locale;
  strings: Strings;
  cardStyle?: CardStyle;
}

function estimateReadTime(article: FeedArticle, strings: Strings): string {
  const text = article.bodyNormalized ?? article.summary ?? "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min${strings.home === "Home" && minutes !== 1 ? "s" : ""}`;
}

export function ArticleCard({
  article,
  selected,
  onSelect,
  locale,
  strings,
  cardStyle = "compact"
}: ArticleCardProps) {
  const [channelLabel, sourceLabel] = getArticleTagLabels(article, strings);
  const relTime = formatRelativeTimestamp(article.publishedAt, locale);
  const readTime = estimateReadTime(article, strings);
  const excerpt = article.summary ?? "";
  const isComfortable = cardStyle === "comfortable";
  const isMagazine = cardStyle === "magazine";
  const sourceAccent = getSourceColor(article.sourceName);

  const rootClass = [
    "group block w-full cursor-pointer overflow-hidden text-left transition-colors duration-100",
    isMagazine
      ? "mb-[10px] rounded-[10px] border p-0"
      : "border-b border-l-2 px-[18px]",
    isMagazine
      ? selected
        ? "border-tb-accent bg-tb-surface-card-selected"
        : "border-tb-border-subtle bg-tb-surface-card hover:bg-tb-surface-card-hover"
      : selected
        ? "border-b-tb-border-subtle border-l-tb-accent bg-tb-surface-card-selected"
        : "border-b-tb-border-subtle border-l-transparent bg-transparent hover:bg-tb-surface-card-hover",
    !isMagazine && isComfortable ? "py-[18px]" : "",
    !isMagazine && !isComfortable ? "py-[14px]" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-current={selected ? "true" : undefined}
      className={rootClass}
      onClick={() => onSelect(article.id)}
      type="button"
    >
      {isMagazine ? (
        <div
          className="flex h-[80px] items-center justify-center text-[11px] italic tracking-[0.05em] text-tb-text-subtle"
          style={{
            background: `linear-gradient(135deg, ${sourceAccent}33, ${sourceAccent}11)`,
            borderRadius: "10px 10px 0 0"
          }}
        >
          {article.sourceName}
        </div>
      ) : null}
      <div className={isMagazine ? "px-4 py-[14px]" : ""}>
        <div className="mb-2 flex items-center gap-2">
          <SourceAvatar size={24} source={article.sourceName} />
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-tb-text-secondary">
            {article.sourceName}
          </span>
          <span className="flex shrink-0 items-center gap-[4px] text-[11px] text-tb-text-muted">
            <ClockIcon size={11} />
            {relTime}
          </span>
        </div>

        <div
          className={[
            isComfortable ? "mb-2 text-[14px]" : "mb-[6px] text-[13px]",
            "overflow-hidden font-semibold leading-[1.45]",
            selected ? "text-tb-text-primary" : "text-tb-text-secondary"
          ].join(" ")}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: isComfortable ? 3 : 2,
            WebkitBoxOrient: "vertical"
          }}
        >
          {article.title}
        </div>

        {(isComfortable || isMagazine) && excerpt ? (
          <div
            className="mb-[10px] overflow-hidden text-[12px] leading-[1.55] text-tb-text-faint"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical"
            }}
          >
            {excerpt}
          </div>
        ) : null}

        <div
          className={[
            "flex flex-wrap items-center gap-[6px]",
            isComfortable ? "mt-[6px]" : "mt-[4px]"
          ].join(" ")}
        >
          <CardTag label={channelLabel} tone="channel" />
          <CardTag label={sourceLabel} tone="source" />
          <span className="ml-auto flex items-center gap-[4px] text-[11px] font-medium text-tb-text-muted">
            <BookOpenIcon size={11} />
            {readTime}
          </span>
        </div>
      </div>
    </button>
  );
}

function CardTag({ label, tone }: { label: string; tone: "channel" | "source" }) {
  if (tone === "channel") {
    return (
      <span className="inline-block whitespace-nowrap rounded-[5px] border border-tb-accent/30 bg-tb-accent/10 px-2 py-[2px] text-[10px] font-medium tracking-[0.02em] text-tb-accent">
        {label}
      </span>
    );
  }
  const color = getSourceColor(label);
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[5px] px-2 py-[2px] text-[10px] font-medium tracking-[0.02em]"
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}33`
      }}
    >
      {label}
    </span>
  );
}
