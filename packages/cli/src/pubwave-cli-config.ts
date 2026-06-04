import { existsSync } from "node:fs";
import { managedJsonConfig, jsonConfigPath, type ManagedJsonConfigOptions, type CliConfigFactory, type PubwaveCliConfig } from "@pubwave/cli";
import { DEFAULT_APP_CONFIG, type AppConfig } from "@techbrief/shared";

type AppConfigPartial = Partial<AppConfig>;

function toCliConfig(config: AppConfig): PubwaveCliConfig {
  return {
    language: config.app.defaultLanguage,
    ai: {
      modelSource: config.ai.modelSource,
      provider: config.ai.provider,
      model: config.ai.model,
      apiKey: config.ai.apiKey
    },
    mobile: {
      enabled: config.mobile.ios.enabled || config.mobile.android.enabled
    }
  };
}

function fromCliConfig(cli: PubwaveCliConfig, current: AppConfig): AppConfigPartial {
  const next: AppConfigPartial = {};

  if (cli.language) {
    next.app = { ...current.app, defaultLanguage: cli.language };
  }

  if (cli.ai) {
    next.ai = {
      modelSource: cli.ai.modelSource ?? current.ai.modelSource,
      provider: cli.ai.provider ?? current.ai.provider,
      model: cli.ai.model ?? current.ai.model,
      apiKey: cli.ai.apiKey ?? current.ai.apiKey
    };
  }

  if (cli.mobile && cli.mobile.enabled !== undefined) {
    const enabled = cli.mobile.enabled;
    next.mobile = {
      ios: { ...current.mobile.ios, enabled },
      android: { ...current.mobile.android, enabled }
    };
  }

  return next;
}

function migrateLegacyAi(raw: Record<string, unknown>): AppConfig {
  const partial = raw as AppConfigPartial;
  const legacyAi = partial.ai as
    | {
        modelSource?: "cloud" | "local";
        provider?: string;
        apiKey?: string;
        model?: string | { summarization?: string; translation?: string; keywords?: string };
      }
    | undefined;

  if (legacyAi && typeof legacyAi.model === "object") {
    const normalizedModel = legacyAi.model.translation
      ?? legacyAi.model.summarization
      ?? legacyAi.model.keywords
      ?? DEFAULT_APP_CONFIG.ai.model;
    partial.ai = {
      modelSource: legacyAi.modelSource ?? (legacyAi.provider === "ollama" || legacyAi.provider === "local" ? "local" : "cloud"),
      provider: legacyAi.provider === "ollama" ? "local" : (legacyAi.provider ?? DEFAULT_APP_CONFIG.ai.provider),
      model: normalizedModel,
      apiKey: legacyAi.apiKey ?? DEFAULT_APP_CONFIG.ai.apiKey
    };
  } else if (legacyAi?.provider === "ollama") {
    partial.ai = {
      modelSource: legacyAi.modelSource ?? "local",
      provider: "local",
      model: typeof legacyAi.model === "string" ? legacyAi.model : DEFAULT_APP_CONFIG.ai.model,
      apiKey: legacyAi.apiKey ?? ""
    };
  }

  return partial as AppConfig;
}

function validate(config: AppConfig): void {
  const days = config.app.freshnessDays;
  if (days !== 1 && days !== 3 && days !== 5 && days !== 7) {
    throw new Error(`Invalid app.freshnessDays: ${String(days)} (allowed: 1, 3, 5, 7)`);
  }
  if (config.ai.modelSource !== "cloud" && config.ai.modelSource !== "local") {
    throw new Error(`Invalid ai.modelSource: ${String(config.ai.modelSource)}`);
  }
}

export const pubwaveCliConfigOptions: ManagedJsonConfigOptions<AppConfig> = {
  fileName: "config.json",
  defaults: () => structuredClone(DEFAULT_APP_CONFIG),
  toCliConfig,
  fromCliConfig,
  migrate: migrateLegacyAi,
  validate
};

export const pubwaveCliConfig: CliConfigFactory<AppConfig> = (context) => {
  const inner = managedJsonConfig<AppConfig>(pubwaveCliConfigOptions)(context);
  const filePath = jsonConfigPath(context, { fileName: "config.json" });

  return {
    ...inner,
    toCliConfig: async (projectConfig: AppConfig): Promise<PubwaveCliConfig> => {
      if (!existsSync(filePath)) {
        return {};
      }
      const cli = toCliConfig(projectConfig);
      // English needs no AI (no translation), so don't surface the cloud/openai
      // defaults in the setup review — they look configured but go unused.
      if (projectConfig.app.defaultLanguage === "en") {
        const { ai: _ai, ...rest } = cli;
        return rest;
      }
      return cli;
    }
  };
};
