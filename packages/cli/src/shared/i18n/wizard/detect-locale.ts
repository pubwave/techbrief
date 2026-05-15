import { SUPPORTED_LANGUAGES } from "@techbrief/shared";
import type { WizardLocale } from "./types.js";

const TIME_ZONE_TO_LOCALE: Array<[prefixes: string[], locale: WizardLocale]> = [
  [["Asia/Tokyo"], "ja"],
  [["Asia/Seoul"], "ko"],
  [["Asia/Shanghai", "Asia/Chongqing", "Asia/Urumqi"], "zh-CN"],
  [["Asia/Taipei", "Asia/Hong_Kong", "Asia/Macau"], "zh-TW"],
  [["Europe/Paris"], "fr"],
  [["Europe/Berlin", "Europe/Vienna", "Europe/Zurich"], "de"],
  [["Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores", "America/Sao_Paulo"], "pt"],
  [[
    "Europe/Madrid",
    "Atlantic/Canary",
    "America/Mexico_City",
    "America/Bogota",
    "America/Lima",
    "America/Santiago",
    "America/Argentina"
  ], "es"]
];

export function detectWizardLocale(): WizardLocale {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  for (const [prefixes, locale] of TIME_ZONE_TO_LOCALE) {
    if (prefixes.some((prefix) => timeZone.startsWith(prefix))) {
      return locale;
    }
  }

  return "en";
}

export function defaultWizardLanguage(locale: WizardLocale): string {
  return SUPPORTED_LANGUAGES.some((language) => language.code === locale) ? locale : "en";
}
