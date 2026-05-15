import React from "react";
import { getAppStateDir, loadConfig, saveConfig, updateConfig } from "@techbrief/runtime";
import { cloudModelChoices } from "../../features/cloud-model/index.js";
import { availableLocalModelChoices, installLocalModelAsync } from "../../features/local-model/index.js";
import { createLine, createSection } from "../../shared/ui/ui.js";
import { workspaceRoot } from "../../shared/paths/workspace.js";

function inferModelSource(provider: string | undefined, current: "cloud" | "local"): "cloud" | "local" {
  if (!provider) {
    return current;
  }

  return provider === "local" ? "local" : "cloud";
}

export async function configGetView(): Promise<React.ReactElement> {
  const config = await loadConfig();

  return createSection("Config", [
    createLine(`Default language: ${config.app.defaultLanguage}`),
    createLine(`Model source: ${config.ai.modelSource}`),
    createLine(`AI provider: ${config.ai.provider}`),
    createLine(`AI model: ${config.ai.model}`),
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
              ? (availableLocalModelChoices()[0]?.value ?? current.ai.model)
              : (cloudModelChoices(nextProvider)[0]?.value ?? current.ai.model))
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
    const installResult = await installLocalModelAsync(config.ai.model);
    localInstallOk = installResult.ok;
    localInstallMessage = installResult.detail;
  }

  return createSection("Config Updated", [
    createLine(`Default language: ${config.app.defaultLanguage}`, "green"),
    createLine(`Model source: ${config.ai.modelSource}`, "green"),
    createLine(`AI provider: ${config.ai.provider}`, "green"),
    createLine(`AI model: ${config.ai.model}`, "cyan"),
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
    ? (availableLocalModelChoices()[0]?.value ?? "qwen2.5:7b")
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
      modelSource: nextModelSource,
      provider: nextProvider,
      model: nextModel,
      apiKey: nextModelSource === "local" ? "" : nextApiKey
    }
  };

  await saveConfig(nextConfig);

  return createSection("Init", [
    createLine(`Workspace: ${workspaceRoot}`),
    createLine(`Default language: ${nextConfig.app.defaultLanguage}`, "green"),
    createLine(`Model source: ${nextConfig.ai.modelSource}`, "green"),
    createLine(`AI provider: ${nextConfig.ai.provider}`, "green"),
    createLine(`AI model: ${nextConfig.ai.model}`, "cyan"),
    createLine(`Freshness days: ${nextConfig.app.freshnessDays}`, "cyan"),
    createLine(`Config has been written to ${getAppStateDir()}/config.json`, "yellow")
  ]);
}
