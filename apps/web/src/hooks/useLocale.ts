import { useEffect, useState } from "react";
import { fetchDefaultLanguage } from "../api/config";
import { fallbackLocale, normalizeLocale, resolveStrings } from "../i18n/registry";
import type { Locale, Strings } from "../i18n/types";

interface LocaleState {
  isReady: boolean;
  locale: Locale;
  strings: Strings;
}

export function useLocale(): LocaleState {
  const [locale, setLocale] = useState<Locale>(fallbackLocale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      try {
        const language = await fetchDefaultLanguage();
        if (active) {
          setLocale(normalizeLocale(language));
        }
      } catch {
        if (active) {
          setLocale(fallbackLocale);
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return {
    isReady,
    locale,
    strings: resolveStrings(locale)
  };
}
