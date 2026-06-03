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

function mergeSourceItems(
  saved: AppConfig["sources"]["items"] | undefined
): AppConfig["sources"]["items"] {
  const defaults = DEFAULT_APP_CONFIG.sources.items;
  const savedItems = saved ?? {};
  const merged: AppConfig["sources"]["items"] = {};
  for (const id of new Set([...Object.keys(defaults), ...Object.keys(savedItems)])) {
    // Per-item merge (not whole-object overwrite) so a saved item that predates
    // `priority` still inherits the default priority; the `priority: 0` floor
    // covers custom sources saved before priorities existed.
    merged[id] = { enabled: true, priority: 0, ...defaults[id], ...savedItems[id] };
  }
  return merged;
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
      ...input.schedule
    },
    ai: {
      ...DEFAULT_APP_CONFIG.ai,
      ...normalizeAiConfig(input)
    },
    sources: {
      items: mergeSourceItems(input.sources?.items)
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
