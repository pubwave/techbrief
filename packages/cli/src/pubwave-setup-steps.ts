import type { CustomSetupStep } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { TECHBRIEF_LOCALE_CATALOGS } from "@techbrief/shared";

const FRESHNESS_VALUES = [1, 3, 5, 7] as const;

function getCatalog(locale: string) {
  return TECHBRIEF_LOCALE_CATALOGS[locale as keyof typeof TECHBRIEF_LOCALE_CATALOGS]
    ?? TECHBRIEF_LOCALE_CATALOGS.en;
}

export const freshnessDaysStep: CustomSetupStep<AppConfig> = {
  id: "freshnessDays",
  insertBefore: "mobileInstall",
  kind: "choice",
  title: ({ locale }) => getCatalog(locale).freshnessTitle,
  hint: ({ locale }) => getCatalog(locale).freshnessHint,
  choices: ({ locale }) => {
    const labels = getCatalog(locale).freshnessLabels;
    return FRESHNESS_VALUES.map((days) => ({
      value: String(days),
      label: labels[days] ?? `${days} days`
    }));
  },
  read(projectConfig) {
    const current = projectConfig.app?.freshnessDays ?? 3;
    return String(current);
  },
  async write(projectConfig, value) {
    const parsed = Number.parseInt(value, 10);
    const next = (FRESHNESS_VALUES as readonly number[]).includes(parsed)
      ? (parsed as 1 | 3 | 5 | 7)
      : projectConfig.app.freshnessDays;
    return {
      projectConfig: {
        ...projectConfig,
        app: { ...projectConfig.app, freshnessDays: next }
      }
    };
  }
};

export const techbriefCustomSteps = [freshnessDaysStep];
