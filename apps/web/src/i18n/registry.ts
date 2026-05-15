import type { Locale, LocaleMessages, Strings } from "./types";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { pt } from "./locales/pt";
import { zhCn } from "./locales/zh-cn";
import { zhTw } from "./locales/zh-tw";

export const fallbackLocale: Locale = "en";

const localeCatalogs: Record<Locale, LocaleMessages> = {
  en,
  "zh-CN": zhCn,
  "zh-TW": zhTw,
  ja,
  ko,
  es,
  fr,
  de,
  pt
};

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) {
    return fallbackLocale;
  }

  return value in localeCatalogs ? (value as Locale) : fallbackLocale;
}

export function resolveStrings(locale: string | null | undefined): Strings {
  const catalog = localeCatalogs[normalizeLocale(locale)];
  return {
    ...catalog,
    themeLabel: (themeId) => catalog.themeLabels[themeId],
    themeSummary: (themeId) => catalog.themeSummaries[themeId]
  };
}
