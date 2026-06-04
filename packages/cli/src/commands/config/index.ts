import React from "react";
import { availableOllamaModelChoices, defaultCloudModelProviders, defaultLocalModelChoices, installOllamaModel } from "@pubwave/cli";
import { getAppStateDir, loadConfig, saveConfig, updateConfig } from "@techbrief/runtime";
import { createLine, createSection } from "../../shared/ui/ui.js";
import { workspaceRoot } from "../../shared/paths/workspace.js";

function inferModelSource(
  provider: string | undefined,
  current: "cloud" | "local" | ""
): "cloud" | "local" | "" {
  if (!provider) {
    return current;
  }

  return provider === "local" ? "local" : "cloud";
}

function defaultCloudModel(provider: string): string | undefined {
  return defaultCloudModelProviders.find((entry) => entry.value === provider)?.models[0]?.value;
}

// AI is "configured" only once a provider and model are chosen; otherwise show
// every AI row as "Not configured" (matches the setup/saved views).
function aiDisplayRows(ai: { modelSource?: string; provider: string; model: string }): {
  source: string;
  provider: string;
  model: string;
} {
  const notConfigured = "Not configured";
  if (!ai.provider || !ai.model) {
    return { source: notConfigured, provider: notConfigured, model: notConfigured };
  }
  return { source: ai.modelSource ?? notConfigured, provider: ai.provider, model: ai.model };
}

export async function configGetView(): Promise<React.ReactElement> {
  const config = await loadConfig();

  const ai = aiDisplayRows(config.ai);
  return createSection("Config", [
    createLine(`Default language: ${config.app.defaultLanguage}`),
    createLine(`Model source: ${ai.source}`),
    createLine(`AI provider: ${ai.provider}`),
    createLine(`AI model: ${ai.model}`),
    createLine(`Freshness days: ${config.app.freshnessDays}`),
    createLine(`Schedule mode: ${config.schedule.mode}`)
  ]);
}

export async function configSetView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const requestedProvider = typeof options.provider === "string" ? options.provider : undefined;
  const requestedApiKey = typeof options["api-key"] === "string" ? options["api-key"] : undefined;
  const requestedModelSource = options["model-source"] === "local"
    ? "local"
    : options["model-source"] === "cloud"
      ? "cloud"
      : undefined;
  const requestedModel = typeof options.model === "string" ? options.model : undefined;

  const config = await updateConfig((current) => ({
    ...current,
    app: {
      ...current.app,
      ...(typeof options.language === "string" ? { defaultLanguage: options.language } : {}),
      ...(typeof options.days === "string"
        ? { freshnessDays: Number.parseInt(options.days, 10) as 1 | 3 | 5 | 7 }
        : {})
    },
    ai: {
      ...current.ai,
      ...(requestedModelSource ? { modelSource: requestedModelSource } : {}),
      ...(() => {
        const nextProvider = requestedProvider
          ?? (requestedModelSource === "local"
            ? "local"
            : requestedModelSource === "cloud"
              ? "openai"
              : current.ai.provider);
        const nextModelSource = requestedModelSource ?? inferModelSource(requestedProvider, current.ai.modelSource);
        const providerChanged = nextProvider !== current.ai.provider;
        const nextModel = requestedModel
          ?? (requestedProvider
            ? (nextModelSource === "local"
              ? (availableOllamaModelChoices(defaultLocalModelChoices)[0]?.value ?? current.ai.model)
              : (defaultCloudModel(nextProvider) ?? current.ai.model))
            : current.ai.model);
        const nextApiKey = nextModelSource === "local"
          ? ""
          : requestedApiKey
            ?? (providerChanged ? "" : current.ai.apiKey);

        return {
          provider: nextProvider,
          model: nextModel,
          apiKey: nextApiKey
        };
      })()
    }
  }));

  let localInstallMessage: string | null = null;
  let localInstallOk = true;
  const shouldInstallLocalModel = config.ai.modelSource === "local"
    && config.ai.provider === "local";

  if (shouldInstallLocalModel) {
    const installResult = await installOllamaModel(config.ai.model, undefined, undefined, { autoInstallRuntime: true, autoStartRuntime: true });
    localInstallOk = installResult.ok;
    localInstallMessage = installResult.detail;
  }

  const aiUpdated = aiDisplayRows(config.ai);
  return createSection("Config Updated", [
    createLine(`Default language: ${config.app.defaultLanguage}`, "green"),
    createLine(`Model source: ${aiUpdated.source}`, "green"),
    createLine(`AI provider: ${aiUpdated.provider}`, "green"),
    createLine(`AI model: ${aiUpdated.model}`, "cyan"),
    createLine(`Freshness days: ${config.app.freshnessDays}`, "cyan"),
    ...(localInstallMessage ? [createLine(localInstallMessage, localInstallOk ? "green" : "yellow")] : [])
  ]);
}

export async function initView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const config = await loadConfig();
  const nextProvider = typeof options.provider === "string" ? options.provider : config.ai.provider;
  const nextModelSource = inferModelSource(nextProvider, config.ai.modelSource);
  const nextApiKey = typeof options["api-key"] === "string"
    ? options["api-key"]
    : nextProvider === config.ai.provider
      ? config.ai.apiKey
      : "";
  const nextModel = nextModelSource === "local" && config.ai.modelSource !== "local"
    ? (availableOllamaModelChoices(defaultLocalModelChoices)[0]?.value ?? "qwen2.5:7b")
    : config.ai.model;
  const nextConfig = {
    ...config,
    app: {
      ...config.app,
      defaultLanguage: typeof options.language === "string" ? options.language : config.app.defaultLanguage,
      freshnessDays:
        typeof options.days === "string"
          ? (Number.parseInt(options.days, 10) as 1 | 3 | 5 | 7)
          : config.app.freshnessDays
    },
    ai: {
      ...config.ai,
      ...(nextModelSource ? { modelSource: nextModelSource } : {}),
      provider: nextProvider,
      model: nextModel,
      apiKey: nextModelSource === "local" ? "" : nextApiKey
    }
  };

  await saveConfig(nextConfig);

  const aiInit = aiDisplayRows(nextConfig.ai);
  return createSection("Init", [
    createLine(`Workspace: ${workspaceRoot}`),
    createLine(`Default language: ${nextConfig.app.defaultLanguage}`, "green"),
    createLine(`Model source: ${aiInit.source}`, "green"),
    createLine(`AI provider: ${aiInit.provider}`, "green"),
    createLine(`AI model: ${aiInit.model}`, "cyan"),
    createLine(`Freshness days: ${nextConfig.app.freshnessDays}`, "cyan"),
    createLine(`Config has been written to ${getAppStateDir()}/config.json`, "yellow")
  ]);
}
