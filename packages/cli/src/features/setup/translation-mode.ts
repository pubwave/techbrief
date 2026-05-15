import { DEFAULT_APP_CONFIG, skipsAiForLanguage, type AppConfig } from "@techbrief/shared";
import type { SetupState } from "./types.js";

const ENGLISH_AI_CONFIG: AppConfig["ai"] = {
  modelSource: "local",
  provider: "local",
  model: "local-default",
  apiKey: ""
};

export function shouldSkipAiSetupForLanguage(language: string): boolean {
  return skipsAiForLanguage(language);
}

export function applyLanguageToSetupState(state: SetupState, language: string): SetupState {
  if (shouldSkipAiSetupForLanguage(language)) {
    return {
      ...state,
      language,
      ...ENGLISH_AI_CONFIG,
      cloudModelInputMode: false
    };
  }

  if (shouldSkipAiSetupForLanguage(state.language)) {
    return {
      ...state,
      language,
      modelSource: DEFAULT_APP_CONFIG.ai.modelSource,
      provider: DEFAULT_APP_CONFIG.ai.provider,
      model: DEFAULT_APP_CONFIG.ai.model,
      apiKey: DEFAULT_APP_CONFIG.ai.apiKey,
      cloudModelInputMode: false
    };
  }

  return {
    ...state,
    language
  };
}

export function resolveAiConfigForSetupState(state: SetupState): AppConfig["ai"] {
  if (shouldSkipAiSetupForLanguage(state.language)) {
    return ENGLISH_AI_CONFIG;
  }

  return {
    modelSource: state.modelSource,
    provider: state.provider,
    model: state.model,
    apiKey: state.apiKey
  };
}

export function shouldShowAiSummary(language: string): boolean {
  return !shouldSkipAiSetupForLanguage(language);
}
