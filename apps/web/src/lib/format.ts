import type { Locale, Strings } from "../i18n/types";
import type { Channel, ChannelFilter, FeedArticle } from "../types/feed";

export function getChannelLabel(channel: ChannelFilter, strings: Strings): string {
  if (channel === "all") {
    return strings.allFilter;
  }
  return channel === "tech-news" ? strings.techNewsFilter : strings.indieDevFilter;
}

export function getArticleTagLabels(article: FeedArticle, strings: Strings): [string, string] {
  return [getChannelLabel(article.contentType, strings), article.sourceName];
}

export function formatRelativeTimestamp(value: string, locale: Locale): string {
  const publishedAt = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(1, Math.round((now - publishedAt) / 60000));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMinutes < 60) {
    return formatter.format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return formatter.format(-diffHours, "hour");
  }

  return formatter.format(-Math.round(diffHours / 24), "day");
}

export function getArticleBody(article: FeedArticle): string[] {
  return (article.bodyNormalized ?? article.summary ?? "").split("\n\n").filter(Boolean);
}
