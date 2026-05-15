import type { EditorLocale, EditorTheme } from "@pubwave/editor";
import type { Locale } from "../i18n/types";
import type { ThemeId } from "../theme/themes";

export function resolvePubwaveLocale(locale: Locale): EditorLocale {
  switch (locale) {
    case "zh-CN":
      return "zh-CN";
    case "zh-TW":
      return "zh";
    case "ja":
      return "ja";
    case "ko":
      return "ko";
    case "fr":
      return "fr";
    case "de":
      return "de";
    case "es":
      return "es";
    case "pt":
      return "pt";
    case "en":
    default:
      return "en";
  }
}

export function createPubwaveTheme(themeId: ThemeId, locale: Locale): EditorTheme {
  const palette = resolveThemePalette(themeId);
  const base: EditorTheme = {
    locale: resolvePubwaveLocale(locale),
    classNamePrefix: "pubwave-editor",
    containerClassName: "tb-article-editor__surface",
    contentClassName: "tb-article-editor__content",
    colors: {
      background: palette.background,
      text: palette.text,
      textMuted: palette.textMuted,
      border: palette.border,
      primary: palette.primary,
      linkColor: palette.linkColor
    }
  };

  if (palette.backgroundImage) {
    base.backgroundImage = palette.backgroundImage;
  }
  if (palette.backgroundImageOptions) {
    base.backgroundImageOptions = palette.backgroundImageOptions;
  }
  return base;
}

function resolveThemePalette(themeId: ThemeId) {
  switch (themeId) {
    case "editorial-dawn":
      return {
        background: "rgba(255, 249, 239, 0.92)",
        text: "#1f2c3a",
        textMuted: "#5f6f82",
        border: "#d9d0bf",
        primary: "#2a7fff",
        linkColor: "#225fd1",
        backgroundImage:
          "radial-gradient(circle at 12% 10%, rgba(255, 221, 163, 0.22), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))",
        backgroundImageOptions: {
          repeat: "no-repeat" as const,
          position: "top left, center",
          size: "auto, cover"
        }
      };
    case "aurora-glass":
      return {
        background: "rgba(18, 55, 64, 0.78)",
        text: "#e8fffb",
        textMuted: "#9fd5d8",
        border: "#2f6672",
        primary: "#74f7d5",
        linkColor: "#9bffea",
        backgroundImage:
          "radial-gradient(circle at 15% 12%, rgba(116, 247, 213, 0.18), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
        backgroundImageOptions: {
          repeat: "no-repeat" as const,
          position: "top left, center",
          size: "auto, cover"
        }
      };
    case "current-theme":
    default:
      return {
        background: "transparent",
        text: "#b0bad4",
        textMuted: "#8892a4",
        border: "transparent",
        primary: "#4d9cf6",
        linkColor: "#4d9cf6"
      };
  }
}
