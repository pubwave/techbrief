import { access } from "node:fs/promises";
import { DEFAULT_APP_CONFIG, type AppConfig } from "@techbrief/shared";
import { getConfigFile } from "../fs/paths.js";
import { readJsonFile, writeJsonFile } from "../fs/json-file.js";

function normalizeAiConfig(input: Partial<AppConfig> | undefined): AppConfig["ai"] {
  const legacyAi = input?.ai as
    | {
        modelSource?: "cloud" | "local";
        provider?: string;
        apiKey?: string;
        model?: string | {
          summarization?: string;
          translation?: string;
          keywords?: string;
        };
      }
    | undefined;

  const rawModel = legacyAi?.model;
  const normalizedModel = typeof rawModel === "string"
    ? rawModel
    : rawModel?.translation
      ?? rawModel?.summarization
      ?? rawModel?.keywords
      ?? DEFAULT_APP_CONFIG.ai.model;
  const rawProvider = legacyAi?.provider ?? DEFAULT_APP_CONFIG.ai.provider;
  const normalizedProvider = rawProvider === "ollama" ? "local" : rawProvider;
  const normalizedModelSource = legacyAi?.modelSource
    ?? (normalizedProvider === "local" ? "local" : "cloud");

  return {
    modelSource: normalizedModelSource,
    provider: normalizedProvider,
    model: normalizedModel,
    apiKey: legacyAi?.apiKey ?? DEFAULT_APP_CONFIG.ai.apiKey
  };
}

function mergeConfig(input: Partial<AppConfig> | undefined): AppConfig {
  if (!input) {
    return structuredClone(DEFAULT_APP_CONFIG);
  }

  return {
    ...DEFAULT_APP_CONFIG,
    ...input,
    app: {
      ...DEFAULT_APP_CONFIG.app,
      ...input.app
    },
    schedule: {
      ...DEFAULT_APP_CONFIG.schedule,
      ...input.schedule,
      perSource: {
        ...DEFAULT_APP_CONFIG.schedule.perSource,
        ...input.schedule?.perSource
      }
    },
    ai: {
      ...DEFAULT_APP_CONFIG.ai,
      ...normalizeAiConfig(input)
    },
    sources: {
      ...DEFAULT_APP_CONFIG.sources,
      ...input.sources,
      techNews: {
        ...DEFAULT_APP_CONFIG.sources.techNews,
        ...input.sources?.techNews
      },
      indieDev: {
        ...DEFAULT_APP_CONFIG.sources.indieDev,
        ...input.sources?.indieDev
      },
      custom: {
        ...DEFAULT_APP_CONFIG.sources.custom,
        ...input.sources?.custom
      }
    },
    web: {
      ...DEFAULT_APP_CONFIG.web,
      ...input.web
    },
    mobile: {
      ios: {
        ...DEFAULT_APP_CONFIG.mobile.ios,
        ...input.mobile?.ios
      },
      android: {
        ...DEFAULT_APP_CONFIG.mobile.android,
        ...input.mobile?.android
      }
    }
  };
}

export async function loadConfig(): Promise<AppConfig> {
  const data = await readJsonFile<Partial<AppConfig> | undefined>(getConfigFile(), undefined);
  return mergeConfig(data);
}

export async function hasSavedConfig(): Promise<boolean> {
  try {
    await access(getConfigFile());
    return true;
  } catch {
    return false;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await writeJsonFile(getConfigFile(), config);
}

export async function updateConfig(updater: (current: AppConfig) => AppConfig): Promise<AppConfig> {
  const current = await loadConfig();
  const next = updater(current);
  await saveConfig(next);
  return next;
}
