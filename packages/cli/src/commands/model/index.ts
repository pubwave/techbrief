import React from "react";
import { loadConfig, updateConfig } from "@techbrief/runtime";
import { detectWizardLocale, formatWizardMessage, wizardMessage } from "../../shared/i18n/wizard/index.js";
import {
  installLocalModelAsync,
  installedLocalModelChoices,
  isLocalSupportAvailable,
  isLocalModelInstalled,
  uninstallLocalModel
} from "../../features/local-model/index.js";
import { createLine, createSection } from "../../shared/ui/ui.js";

export async function modelLocalListView(): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  if (!isLocalSupportAvailable()) {
    return createSection(wizardMessage(locale, "modelLocalListTitle"), [
      createLine(wizardMessage(locale, "localModelNotInstalledPath"), "yellow"),
      createLine(wizardMessage(locale, "modelLocalInstallHint"), "cyan")
    ]);
  }

  const models = installedLocalModelChoices();

  if (models.length === 0) {
    return createSection(wizardMessage(locale, "modelLocalListTitle"), [
      createLine(wizardMessage(locale, "modelLocalEmpty"), "yellow")
    ]);
  }

  return createSection(wizardMessage(locale, "modelLocalListTitle"), models.map((model) =>
    createLine(`${model.value} - ${model.description}`, "cyan", model.value)
  ));
}

export async function modelLocalInstallView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  const model = typeof options.model === "string" ? options.model : undefined;
  if (!model) {
    return createSection(wizardMessage(locale, "modelLocalInstallTitle"), [
      createLine(wizardMessage(locale, "modelLocalMissingModel"), "red")
    ]);
  }

  const result = await installLocalModelAsync(model, undefined, undefined, undefined, locale);

  return createSection(wizardMessage(locale, "modelLocalInstallTitle"), [
    createLine(result.detail, result.ok ? "green" : "red")
  ]);
}

export async function modelLocalUseView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  const model = typeof options.model === "string" ? options.model : undefined;
  if (!model) {
    return createSection(wizardMessage(locale, "modelLocalUseTitle"), [
      createLine(wizardMessage(locale, "modelLocalMissingModel"), "red")
    ]);
  }

  if (!isLocalModelInstalled(model)) {
    return createSection(wizardMessage(locale, "modelLocalUseTitle"), [
      createLine(formatWizardMessage(locale, "localModelNotInstalledInOllama", { model }), "red"),
      createLine(formatWizardMessage(locale, "modelLocalUseInstallFirst", { model }), "yellow")
    ]);
  }

  const config = await updateConfig((current) => ({
    ...current,
      ai: {
        ...current.ai,
        modelSource: "local",
        provider: "local",
        model,
        apiKey: ""
      }
  }));

  return createSection(wizardMessage(locale, "modelLocalUseTitle"), [
    createLine(formatWizardMessage(locale, "modelLocalUsing", { model: config.ai.model }), "green"),
    createLine(`Model source: ${config.ai.modelSource}`, "cyan"),
    createLine(`AI provider: ${config.ai.provider}`, "cyan")
  ]);
}

export async function modelLocalUninstallView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  const model = typeof options.model === "string" ? options.model : undefined;
  if (!model) {
    return createSection(wizardMessage(locale, "modelLocalUninstallTitle"), [
      createLine(wizardMessage(locale, "modelLocalMissingModel"), "red")
    ]);
  }

  const config = await loadConfig();
  const result = uninstallLocalModel(model, locale);
  const lines = [
    createLine(result.detail, result.ok ? "green" : "red")
  ];

  if (result.ok && config.ai.modelSource === "local" && config.ai.provider === "local" && config.ai.model === model) {
    lines.push(createLine(
      formatWizardMessage(locale, "modelLocalUninstallConfigWarning", { model }),
      "yellow"
    ));
  }

  return createSection(wizardMessage(locale, "modelLocalUninstallTitle"), lines);
}
