import { loadConfig } from "@techbrief/runtime";
import type { AppConfig } from "@techbrief/shared";
import { resolveAiConfigForSetupState } from "../translation-mode.js";
import type { SetupLaunchFlowInput } from "./types.js";

export async function buildNextConfig(state: SetupLaunchFlowInput["state"]): Promise<AppConfig> {
  const current = await loadConfig();
  return {
    ...current,
    app: {
      ...current.app,
      defaultLanguage: state.language,
      freshnessDays: state.freshnessDays
    },
    ai: resolveAiConfigForSetupState(state),
    mobile: {
      ios: {
        ...current.mobile.ios,
        enabled: state.mobileInstall === "install"
      },
      android: {
        ...current.mobile.android,
        enabled: state.mobileInstall === "install"
      }
    }
  };
}
