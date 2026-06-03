export type TechBriefLocale = "en" | "zh-CN" | "zh-TW" | "ja" | "ko" | "es" | "fr" | "de" | "pt";

export interface TechBriefLocaleCatalog {
  stageTitle: string;
  readyTitle: string;
  readyHint: string;
  launchFailedLabel: string;
  serviceFailedLabel: string;
  serviceStartFailedLabel: string;
  runtimeLabel: string;
  noneLabel: string;
  substageLabels: Record<string, string>;
  freshnessTitle: string;
  freshnessHint: string;
  freshnessLabels: Record<number, string>;
  freshnessRowLabel: string;
  scheduleLabel: string;
  sourcesLabel: string;
}
