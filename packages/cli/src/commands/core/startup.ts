import React from "react";
import { hasSavedConfig, loadConfig } from "@techbrief/runtime";
import type { AppConfig } from "@techbrief/shared";
import { SavedLaunchView } from "../../features/setup/components/saved-launch-view.js";
import { SetupLaunchWizard } from "../../features/setup/components/setup-launch-wizard.js";
import { applyLanguageToSetupState } from "../../features/setup/translation-mode.js";
import type { SetupState } from "../../features/setup/types.js";
import type { LaunchOptions } from "../../app/launch-options.js";

export async function startupView(
  command: string,
  options: Record<string, string | boolean>,
  launchOptions: LaunchOptions
): Promise<React.ReactElement | null> {
  switch (command) {
    case "":
      if (await hasSavedConfig()) {
        const config = await loadConfig();
        return React.createElement(SavedLaunchView, {
          config,
          initialState: configToSetupState(config),
          launchOptions
        });
      }

      return React.createElement(SetupLaunchWizard, { launchOptions });
    case "launch":
      return null;
    case "setup":
      return React.createElement(SetupLaunchWizard, { launchOptions });
    case "status":
    case "down":
    case "logs":
    case "doctor":
    case "install":
    case "up":
    case "web up":
    case "web down":
    case "web logs":
    case "mobile run android":
    case "mobile run ios":
    case "sync":
    case "build":
      return null;
    default:
      return null;
  }
}

function configToSetupState(config: AppConfig): SetupState {
  return applyLanguageToSetupState({
    language: config.app.defaultLanguage,
    modelSource: config.ai.modelSource,
    provider: config.ai.provider,
    model: config.ai.model,
    cloudModelInputMode: false,
    apiKey: config.ai.apiKey,
    freshnessDays: config.app.freshnessDays,
    mobileInstall: config.mobile.android.enabled || config.mobile.ios.enabled ? "install" : "skip",
    mobilePlatform: config.mobile.ios.enabled ? "ios" : "android"
  }, config.app.defaultLanguage);
}
