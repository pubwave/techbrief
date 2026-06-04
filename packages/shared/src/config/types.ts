import type { SchedulePolicy } from "../content/types.js";

export interface AiConfig {
  // "" means "not configured yet" (e.g. an English reader that never needs AI).
  // The setup wizard sets "cloud"/"local" when a translation language is chosen.
  // Code that branches on it must treat "" as "not local".
  modelSource: "cloud" | "local" | "";
  provider: string;
  model: string;
  apiKey: string;
}

export interface SourceItemConfig {
  enabled: boolean;
  // Per-source ranking priority (higher = ranked higher in the feed). Defaults
  // from the source definition; user-adjustable.
  priority: number;
}

export interface SourcesConfig {
  items: Record<string, SourceItemConfig>;
}

export interface AppConfig {
  app: {
    defaultLanguage: string;
    freshnessDays: 1 | 3 | 5 | 7;
  };
  server?: {
    apiPort?: number;
    webPort?: number;
  };
  schedule: {
    mode: SchedulePolicy["mode"];
    intervalMinutes?: number;
    cron?: string;
  };
  ai: AiConfig;
  sources: {
    items: SourcesConfig["items"];
  };
  mobile: {
    ios: { enabled: boolean };
    android: { enabled: boolean };
  };
}
