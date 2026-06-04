import type { AppConfig } from "./types.js";
import { DEFAULT_SOURCES } from "../source/default-sources.js";

export const DEFAULT_SCHEDULE_INTERVAL_MINUTES = 15;
// Lower bound for the interval. The scheduler polls roughly once a minute, so a
// shorter interval can't be honored and a 0/negative value would make every
// source perpetually "due" and hammer feeds on every tick.
export const MIN_SCHEDULE_INTERVAL_MINUTES = 1;
export const DEFAULT_SCHEDULE_CRON = `*/${DEFAULT_SCHEDULE_INTERVAL_MINUTES} * * * *`;

function buildDefaultSourceItems(): AppConfig["sources"]["items"] {
  return Object.fromEntries(
    DEFAULT_SOURCES.map((source) => [source.id, { enabled: true, priority: source.priority }])
  );
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  app: {
    defaultLanguage: "en",
    freshnessDays: 3
  },
  schedule: {
    mode: "interval",
    intervalMinutes: DEFAULT_SCHEDULE_INTERVAL_MINUTES
  },
  ai: {
    // Unconfigured by default ("" = not set). The setup wizard fills these when a
    // non-English reading language needs AI translation; English never uses AI,
    // so nothing is pre-selected and the UI shows "not configured".
    modelSource: "",
    provider: "",
    model: "",
    apiKey: ""
  },
  sources: {
    items: buildDefaultSourceItems()
  },
  server: {
    apiPort: 9541,
    webPort: 9540
  },
  mobile: {
    ios: {
      enabled: true
    },
    android: {
      enabled: true
    }
  }
};
