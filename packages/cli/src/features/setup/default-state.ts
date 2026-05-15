import { DEFAULT_APP_CONFIG } from "@techbrief/shared";
import { defaultWizardLanguage, type WizardLocale } from "../../shared/i18n/wizard/index.js";
import { applyLanguageToSetupState } from "./translation-mode.js";
import type { SetupState } from "./types.js";

export function createDefaultSetupState(locale: WizardLocale): SetupState {
  const language = defaultWizardLanguage(locale);

  return applyLanguageToSetupState({
    language: defaultWizardLanguage(locale),
    modelSource: DEFAULT_APP_CONFIG.ai.modelSource,
    provider: DEFAULT_APP_CONFIG.ai.provider,
    model: DEFAULT_APP_CONFIG.ai.model,
    cloudModelInputMode: false,
    apiKey: DEFAULT_APP_CONFIG.ai.apiKey,
    freshnessDays: DEFAULT_APP_CONFIG.app.freshnessDays,
    mobileInstall: DEFAULT_APP_CONFIG.mobile.android.enabled || DEFAULT_APP_CONFIG.mobile.ios.enabled ? "install" : "skip",
    mobilePlatform: DEFAULT_APP_CONFIG.mobile.ios.enabled ? "ios" : "android"
  }, language);
}
