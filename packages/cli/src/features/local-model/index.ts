import type { ModelChoice as SharedModelChoice } from "../../shared/models/index.js";
import { type WizardLocale } from "../../shared/i18n/wizard/index.js";
import {
  ensureLocalSupportInstalledAsync,
  ensureLocalSupportRuntimeReady,
  isLocalSupportAvailable,
  type LocalSupportEnsureProgressStage
} from "./runtime/local-support.js";
import {
  localModelAlreadyAvailable,
  localModelNotInstalledInOllama,
  localModelNotInstalledPath,
  localModelPrepareFailed,
  localModelReady,
  localModelRemoved,
  localModelRemoveFailed,
  localModelVerificationFailed,
  resolveLocalModelLocale
} from "./local-model-messages.js";
import { verifyLocalModelReady } from "./runtime/local-verify.js";
import { runCommand, runCommandAsync } from "../../shared/paths/workspace.js";
import { recommendedLocalModelChoicesForTranslation } from "./catalog/supported-local-models.js";

export type ModelChoice = SharedModelChoice;

export const recommendedLocalModelChoices: ModelChoice[] = [...recommendedLocalModelChoicesForTranslation];

export interface LocalModelInstallResult {
  ok: boolean;
  detail: string;
}

export type LocalModelInstallProgressStage =
  | "check-ollama"
  | "install-ollama"
  | "start-runtime"
  | "check-model"
  | "pull-model"
  | "verify-model";

export interface LocalModelUninstallResult {
  ok: boolean;
  detail: string;
}

export function installedLocalModelChoices(): ModelChoice[] {
  if (!isLocalSupportAvailable()) {
    return [];
  }

  const listResult = runCommand("ollama", ["list"]);
  if (!listResult.ok || !listResult.stdout) {
    return [];
  }

  return parseInstalledLocalModels(listResult.stdout);
}

export function isLocalModelInstalled(model: string): boolean {
  return installedLocalModelChoices().some((choice) => choice.value === model);
}

export function availableLocalModelChoices(): ModelChoice[] {
  const recommendedByValue = new Map(recommendedLocalModelChoices.map((choice) => [choice.value, choice]));
  const installedModels = installedLocalModelChoices();

  if (installedModels.length === 0) {
    return [...recommendedLocalModelChoices];
  }

  const installedChoices = installedModels.map((model) => {
    const recommended = recommendedByValue.get(model.value);
    if (!recommended) {
      return model;
    }

    return {
      ...recommended,
      label: `${recommended.label} (Installed)`,
      description: "Already installed in local Ollama."
    };
  });

  const installedValues = new Set(installedChoices.map((choice) => choice.value));
  const recommendedChoices = recommendedLocalModelChoices.filter((choice) => !installedValues.has(choice.value));

  return [...installedChoices, ...recommendedChoices];
}

export async function installLocalModelAsync(
  model: string,
  onProgress?: (stage: LocalModelInstallProgressStage, model: string) => void,
  onOutput?: (line: string, stream: "stdout" | "stderr") => void,
  interactiveNotice?: string,
  locale?: WizardLocale,
  input?: { session?: boolean }
): Promise<LocalModelInstallResult> {
  const resolvedLocale = resolveLocalModelLocale(locale);
  const ensureResult = await ensureLocalSupportInstalledAsync(
    (stage: LocalSupportEnsureProgressStage) => {
      onProgress?.(stage === "check" ? "check-ollama" : "install-ollama", model);
    },
    {
      ...(interactiveNotice ? { interactiveNotice } : {}),
      locale: resolvedLocale
    }
  );
  if (!ensureResult.ok) {
    return {
      ok: false,
      detail: ensureResult.detail
    };
  }

  onProgress?.("start-runtime", model);
  const runtimeResult = await ensureLocalSupportRuntimeReady(input);
  if (!runtimeResult.ok) {
    return {
      ok: false,
      detail: runtimeResult.detail
    };
  }

  onProgress?.("check-model", model);
  if (isLocalModelInstalled(model)) {
    return {
      ok: true,
      detail: localModelAlreadyAvailable(
        resolvedLocale,
        model,
        ensureResult.attemptedInstall || runtimeResult.attemptedInstall
      )
    };
  }

  onProgress?.("pull-model", model);
  const pullResult = await runCommandAsync("ollama", ["pull", model], undefined, {
    onStdout: (chunk) => onOutput?.(chunk, "stdout"),
    onStderr: (chunk) => onOutput?.(chunk, "stderr")
  });

  if (!pullResult.ok) {
    return {
      ok: false,
      detail: pullResult.stderr || pullResult.stdout || localModelPrepareFailed(resolvedLocale, model)
    };
  }

  onProgress?.("verify-model", model);
  const verifyResult = await verifyLocalModelReady(model);
  if (!verifyResult.ok) {
    return {
      ok: false,
      detail: verifyResult.detail
        ? localModelVerificationFailed(resolvedLocale, model, verifyResult.detail)
        : localModelPrepareFailed(resolvedLocale, model)
    };
  }

  return {
    ok: true,
    detail: localModelReady(
      resolvedLocale,
      model,
      ensureResult.attemptedInstall || runtimeResult.attemptedInstall
    )
  };
}

export function uninstallLocalModel(model: string, locale?: WizardLocale): LocalModelUninstallResult {
  const resolvedLocale = resolveLocalModelLocale(locale);
  if (!isLocalSupportAvailable()) {
    return {
      ok: false,
      detail: localModelNotInstalledPath(resolvedLocale)
    };
  }

  if (!isLocalModelInstalled(model)) {
    return {
      ok: false,
      detail: localModelNotInstalledInOllama(resolvedLocale, model)
    };
  }

  const removeResult = runCommand("ollama", ["rm", model]);
  return {
    ok: removeResult.ok,
    detail: removeResult.ok
      ? localModelRemoved(resolvedLocale, model)
      : (removeResult.stderr || removeResult.stdout || localModelRemoveFailed(resolvedLocale, model))
  };
}

export { isLocalSupportAvailable };

function parseInstalledLocalModels(stdout: string): ModelChoice[] {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const dataLines = lines.filter((line, index) => index > 0 && !line.startsWith("NAME"));

  return dataLines.flatMap((line) => {
    const [modelName] = line.split(/\s+/);
    if (!modelName) {
      return [];
    }

    return {
      label: `${modelName} (Installed)`,
      value: modelName,
      description: "Already installed in local Ollama."
    };
  });
}
