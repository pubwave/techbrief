import type { SavedViewContext, SavedViewRow } from "@pubwave/cli";
import type { AppConfig } from "@techbrief/shared";
import { TECHBRIEF_LOCALE_CATALOGS } from "@techbrief/shared";

function getCatalog(locale: string) {
  return TECHBRIEF_LOCALE_CATALOGS[locale as keyof typeof TECHBRIEF_LOCALE_CATALOGS]
    ?? TECHBRIEF_LOCALE_CATALOGS.en;
}

export function techbriefAdditionalRows(ctx: SavedViewContext<AppConfig>): SavedViewRow[] {
  const config = ctx.projectConfig;
  const locale = ctx.initialConfig.language ?? "en";
  const catalog = getCatalog(locale);

  const enabledSourceCount = Object.values(config.sources?.items ?? {}).filter((item) => item.enabled).length;

  const rows: SavedViewRow[] = [
    { label: catalog.freshnessRowLabel, value: config.app?.freshnessDays },
    { label: catalog.scheduleLabel, value: config.schedule?.mode },
    { label: catalog.sourcesLabel, value: enabledSourceCount > 0 ? String(enabledSourceCount) : catalog.noneLabel }
  ];

  return rows;
}
