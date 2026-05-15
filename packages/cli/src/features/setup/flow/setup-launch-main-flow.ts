import { loadArticleProcessingSnapshot, saveConfig } from "@techbrief/runtime";
import { launchTechBrief } from "../../runtime-launch/index.js";
import { inspectMobileReadiness } from "../../mobile-install/index.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import {
  createMobileDeviceChoiceState,
  createMobileRetryState
} from "../state/setup-launch-mobile-state.js";
import { classifyMobileRetryGuide } from "../../mobile-install/errors/retry-errors.js";
import type {
  SetupLaunchFlowInput,
  SetupLaunchFlowResult
} from "./types.js";
import { buildNextConfig } from "./setup-launch-config.js";
import { ensureLocalModel } from "./setup-launch-local-model.js";
import { appendLaunchProgress } from "./setup-launch-runtime-progress.js";
import { runSingleDeviceMobileInstall } from "./setup-launch-single-device.js";

export async function runSetupLaunchFlow(
  input: SetupLaunchFlowInput
): Promise<SetupLaunchFlowResult> {
  const nextConfig = await buildNextConfig(input.state);

  await ensureLocalModel(input);
  await input.actions.appendProgressAndYield(
    wizardMessage(input.locale, "progressSaveConfig"),
    "cyan",
    wizardMessage(input.locale, "progressSavedConfig")
  );
  await saveConfig(nextConfig);
  const processingSnapshot = await loadArticleProcessingSnapshot(nextConfig.app.defaultLanguage);
  input.actions.clearArticleProcessingStates();
  input.actions.updateArticleProcessingProgress({
    total: processingSnapshot.total,
    processed: processingSnapshot.processed,
    saved: processingSnapshot.saved
  });
  for (const article of processingSnapshot.processingArticles) {
    input.actions.updateArticleProcessingState(article, "processing");
  }

  const result = await launchTechBrief({
    ...input.launchOptions,
    locale: input.locale,
    noMobile: true,
    noOpen: true,
    onProgress: (stage) => appendLaunchProgress(input, stage),
    onOutput: (line, stream) => input.actions.appendOutput(line, stream),
    onProgressText: (text) => input.actions.updateProgressAndYield(text),
    onArticleProcessingProgress: (progress) => input.actions.updateArticleProcessingProgress(progress),
    onArticleStatus: (article, status) => input.actions.updateArticleProcessingState(article, status),
    ...(input.onServicesReady ? { onServicesReady: input.onServicesReady } : {})
  });

  if (input.state.mobileInstall !== "install" || !result.steps.every((step) => step.ok)) {
    return {
      kind: "done",
      launchResult: result
    };
  }

  await input.actions.appendProgressAndYield(
    wizardMessage(input.locale, "progressPrepareMobile"),
    "cyan",
    wizardMessage(input.locale, "progressPreparedMobile")
  );
  const readiness = await inspectMobileReadiness(input.locale, {
    onStep: input.actions.appendMobileProgress,
    onFlutterProgress: input.actions.appendMobileFlutterProgress
  });

  if (!readiness.ok) {
    const retryGuideKind = classifyMobileRetryGuide(
      input.locale,
      readiness.steps.map((step) => step.detail)
    );

    return {
      kind: "retry",
      launchResult: result,
      retryState: createMobileRetryState({
        apiUrl: result.apiUrl,
        webUrl: result.webUrl,
        runtimeRoot: result.runtimeRoot,
        workspaceDir: result.workspaceDir,
        locale: input.locale,
        preferredDeviceIds: readiness.devices.map((device) => device.id),
        ...(retryGuideKind ? { retryGuideKind } : {}),
        rawSteps: readiness.steps
      })
    };
  }

  if (readiness.devices.length > 1) {
    return {
      kind: "choice",
      launchResult: result,
      choiceState: createMobileDeviceChoiceState({
        apiUrl: result.apiUrl,
        webUrl: result.webUrl,
        runtimeRoot: result.runtimeRoot,
        workspaceDir: result.workspaceDir,
        devices: readiness.devices
      })
    };
  }

  return await runSingleDeviceMobileInstall(input, result, readiness.devices);
}
