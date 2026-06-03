import type { Locale, Strings } from "../i18n/types";
import type { ChannelFilter, FeedArticle } from "../types/feed";

type RelativeTimeLabels = {
  now: string;
  minute: (value: number) => string;
  hour: (value: number) => string;
  day: (value: number) => string;
  month: (value: number) => string;
  year: (value: number) => string;
};

const englishUnit = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"} ago`;
const frenchUnit = (value: number, unit: string, plural = `${unit}s`) => `il y a ${value} ${value === 1 ? unit : plural}`;
const germanUnit = (value: number, unit: string, plural = `${unit}n`) => `vor ${value} ${value === 1 ? unit : plural}`;
const spanishUnit = (value: number, unit: string, plural = `${unit}s`) => `hace ${value} ${value === 1 ? unit : plural}`;
const portugueseUnit = (value: number, unit: string, plural = `${unit}s`) => `há ${value} ${value === 1 ? unit : plural}`;

const relativeTimeLabels: Record<Locale, RelativeTimeLabels> = {
  en: {
    now: "just now",
    minute: (value) => englishUnit(value, "minute"),
    hour: (value) => englishUnit(value, "hour"),
    day: (value) => englishUnit(value, "day"),
    month: (value) => englishUnit(value, "month"),
    year: (value) => englishUnit(value, "year")
  },
  "zh-CN": {
    now: "刚刚",
    minute: (value) => `${value}分钟前`,
    hour: (value) => `${value}小时前`,
    day: (value) => `${value}天前`,
    month: (value) => `${value}个月前`,
    year: (value) => `${value}年前`
  },
  "zh-TW": {
    now: "剛剛",
    minute: (value) => `${value}分鐘前`,
    hour: (value) => `${value}小時前`,
    day: (value) => `${value}天前`,
    month: (value) => `${value}個月前`,
    year: (value) => `${value}年前`
  },
  ja: {
    now: "たった今",
    minute: (value) => `${value}分前`,
    hour: (value) => `${value}時間前`,
    day: (value) => `${value}日前`,
    month: (value) => `${value}か月前`,
    year: (value) => `${value}年前`
  },
  ko: {
    now: "방금 전",
    minute: (value) => `${value}분 전`,
    hour: (value) => `${value}시간 전`,
    day: (value) => `${value}일 전`,
    month: (value) => `${value}개월 전`,
    year: (value) => `${value}년 전`
  },
  es: {
    now: "ahora mismo",
    minute: (value) => spanishUnit(value, "minuto"),
    hour: (value) => spanishUnit(value, "hora"),
    day: (value) => spanishUnit(value, "día", "días"),
    month: (value) => spanishUnit(value, "mes", "meses"),
    year: (value) => spanishUnit(value, "año")
  },
  fr: {
    now: "à l'instant",
    minute: (value) => frenchUnit(value, "minute"),
    hour: (value) => frenchUnit(value, "heure"),
    day: (value) => frenchUnit(value, "jour"),
    month: (value) => frenchUnit(value, "mois", "mois"),
    year: (value) => frenchUnit(value, "an", "ans")
  },
  de: {
    now: "gerade eben",
    minute: (value) => germanUnit(value, "Minute"),
    hour: (value) => germanUnit(value, "Stunde"),
    day: (value) => germanUnit(value, "Tag", "Tagen"),
    month: (value) => germanUnit(value, "Monat", "Monaten"),
    year: (value) => germanUnit(value, "Jahr", "Jahren")
  },
  pt: {
    now: "agora mesmo",
    minute: (value) => portugueseUnit(value, "minuto"),
    hour: (value) => portugueseUnit(value, "hora"),
    day: (value) => portugueseUnit(value, "dia"),
    month: (value) => portugueseUnit(value, "mês", "meses"),
    year: (value) => portugueseUnit(value, "ano")
  }
};

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
  const diffMs = Number.isFinite(publishedAt) ? Math.max(0, now - publishedAt) : 0;
  const labels = relativeTimeLabels[locale];
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return labels.now;
  }

  if (diffMinutes < 60) {
    return labels.minute(diffMinutes);
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return labels.hour(diffHours);
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return labels.day(diffDays);
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return labels.month(diffMonths);
  }

  return labels.year(Math.floor(diffMonths / 12));
}

export function getArticleBody(article: FeedArticle): string[] {
  return (article.bodyNormalized ?? article.summary ?? "").split("\n\n").filter(Boolean);
}
