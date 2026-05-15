import type { ContentType, SchedulePolicy } from "../content/types.js";

export interface AiConfig {
  modelSource: "cloud" | "local";
  provider: string;
  model: string;
  apiKey: string;
}

export interface SourceCollectionConfig {
  enabled: boolean;
  preset?: "core-default" | "custom";
  items?: string[];
}

export interface CustomSourceConfig {
  enabled: boolean;
  requireValidation: boolean;
  requireDeclaredCategory: boolean;
  allowCategories: ContentType[];
}

export interface AppConfig {
  app: {
    defaultLanguage: string;
    freshnessDays: 1 | 3 | 5 | 7;
  };
  schedule: {
    mode: SchedulePolicy["mode"];
    intervalHours?: number;
    cron?: string;
    timezone: string;
    perSource: Record<string, SchedulePolicy>;
  };
  ai: AiConfig;
  sources: {
    techNews: SourceCollectionConfig;
    indieDev: SourceCollectionConfig;
    custom: CustomSourceConfig;
  };
  web: {
    docker: boolean;
  };
  mobile: {
    ios: { enabled: boolean };
    android: { enabled: boolean };
  };
}
