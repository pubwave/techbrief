import type { WizardLocale } from "./types.js";

const ANDROID_DEBUGGING_GUIDE_URL = "https://developer.android.com/studio/debug/dev-options";
const IOS_DEVELOPER_MODE_FALLBACK_URL = "https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device";

const IOS_TRUST_COMPUTER_URLS: Partial<Record<WizardLocale, string>> = {
  en: "https://support.apple.com/en-us/109054",
  "zh-CN": "https://support.apple.com/zh-cn/109054",
  "zh-TW": "https://support.apple.com/zh-tw/109054",
  ja: "https://support.apple.com/ja-jp/109054",
  ko: "https://support.apple.com/ko-kr/109054",
  es: "https://support.apple.com/es-es/109054",
  fr: "https://support.apple.com/fr-fr/109054",
  de: "https://support.apple.com/de-de/109054",
  pt: "https://support.apple.com/pt-br/109054"
};

const IOS_DEVELOPER_MODE_URLS: Partial<Record<WizardLocale, string>> = {
  en: IOS_DEVELOPER_MODE_FALLBACK_URL
};

function localizedUrl(locale: WizardLocale, urls: Partial<Record<WizardLocale, string>>, fallbackUrl: string): string {
  return urls[locale] ?? urls.en ?? fallbackUrl;
}

export function mobileDocLinks(locale: WizardLocale): Record<"androidGuideUrl" | "iosTrustUrl" | "iosDeveloperModeUrl", string> {
  return {
    androidGuideUrl: ANDROID_DEBUGGING_GUIDE_URL,
    iosTrustUrl: localizedUrl(locale, IOS_TRUST_COMPUTER_URLS, IOS_TRUST_COMPUTER_URLS.en ?? ""),
    iosDeveloperModeUrl: localizedUrl(locale, IOS_DEVELOPER_MODE_URLS, IOS_DEVELOPER_MODE_FALLBACK_URL)
  };
}

export function interpolateMobileDocLinks(text: string, locale: WizardLocale): string {
  const links = mobileDocLinks(locale);

  return text
    .replaceAll("{{androidGuideUrl}}", links.androidGuideUrl)
    .replaceAll("{{iosTrustUrl}}", links.iosTrustUrl)
    .replaceAll("{{iosDeveloperModeUrl}}", links.iosDeveloperModeUrl);
}
