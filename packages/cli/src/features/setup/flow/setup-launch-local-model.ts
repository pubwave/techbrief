import { installLocalModelAsync, isLocalModelInstalled } from "../../local-model/index.js";
import { isLocalSupportAvailable } from "../../local-model/runtime/local-support.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import { stripTrailingDots } from "../helpers.js";
import { shouldSkipAiSetupForLanguage } from "../translation-mode.js";
import type { SetupLaunchFlowInput } from "./types.js";

export async function ensureLocalModel(input: SetupLaunchFlowInput): Promise<void> {
  if (shouldSkipAiSetupForLanguage(input.state.language)) {
    return;
  }

  if (input.state.modelSource !== "local") {
    return;
  }

  if (isLocalModelInstalled(input.state.model)) {
    input.actions.setInstallMessage(null);
    input.actions.appendProgress(
      `${stripTrailingDots(wizardMessage(input.locale, "progressCheckLocalModel"))}: ${input.state.model}`,
      "green",
      `${stripTrailingDots(wizardMessage(input.locale, "progressCheckedLocalModel"))}: ${input.state.model}`
    );
    return;
  }

  input.actions.appendProgress(
    wizardMessage(input.locale, "progressCheckOllama"),
    "cyan",
    wizardMessage(input.locale, "progressCheckedOllama")
  );

  const installResult = await installLocalModelAsync(
    input.state.model,
    (stage, model) => {
      switch (stage) {
        case "check-ollama":
          return;
        case "install-ollama":
          input.actions.appendProgress(
            wizardMessage(input.locale, "progressInstallOllama"),
            "yellow",
            wizardMessage(input.locale, "progressInstalledOllama")
          );
          return;
        case "check-model":
          input.actions.appendProgress(
            `${stripTrailingDots(wizardMessage(input.locale, "progressCheckLocalModel"))}: ${model}`,
            "cyan",
            `${stripTrailingDots(wizardMessage(input.locale, "progressCheckedLocalModel"))}: ${model}`
          );
          return;
        case "start-runtime":
          input.actions.appendProgress(
            wizardMessage(input.locale, "progressStartLocalRuntime"),
            "yellow",
            wizardMessage(input.locale, "progressStartedLocalRuntime")
          );
          return;
        case "pull-model":
          input.actions.appendProgress(
            `${stripTrailingDots(wizardMessage(input.locale, "progressInstallLocalModel"))}: ${model}`,
            "yellow",
            `${stripTrailingDots(wizardMessage(input.locale, "progressInstalledLocalModel"))}: ${model}`
          );
          return;
        case "verify-model":
          input.actions.appendProgress(
            `${stripTrailingDots(wizardMessage(input.locale, "progressVerifyLocalModel"))}: ${model}`,
            "cyan",
            `${stripTrailingDots(wizardMessage(input.locale, "progressVerifiedLocalModel"))}: ${model}`
          );
          return;
      }
    },
    (line, stream) => {
      input.actions.appendOutput(line, stream);
    },
    !isLocalSupportAvailable() ? wizardMessage(input.locale, "progressInstallOllamaHint") : undefined,
    undefined,
    { session: input.launchOptions.session === true }
  );

  input.actions.setInstallMessage(installResult.ok ? null : installResult.detail);
  if (!installResult.ok) {
    throw new Error(installResult.detail);
  }

  input.actions.clearOutput();
}
