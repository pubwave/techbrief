import { DEFAULT_OPENAI_MODEL } from "@techbrief/shared";
import { availableLocalModelChoices, type ModelChoice } from "../local-model/index.js";
import {
  localizedCloudModelChoices,
  localizedCloudProviderChoices,
  localizedFreshnessChoices,
  localizedLanguageChoices,
  localizedLocalModelChoices,
  localizedMobileInstallChoices,
  localizedModelSourceChoices,
  wizardMessage,
  type WizardLocale
} from "../../shared/i18n/wizard/index.js";
import { applyLanguageToSetupState, shouldSkipAiSetupForLanguage } from "./translation-mode.js";
import type { SetupState, SetupStep, VisibleChoiceWindow } from "./types.js";

export const MAX_OUTPUT_LINES = 120;

export function buildSteps(
  state: SetupState,
  locale: WizardLocale,
  localModelChoices: ModelChoice[],
  localModelGroups?: SetupStep["choiceGroups"]
): SetupStep[] {
  const steps: SetupStep[] = [
    {
      id: "language",
      title: wizardMessage(locale, "readingLanguageTitle"),
      hint: wizardMessage(locale, "readingLanguageHint"),
      choices: localizedLanguageChoices(locale)
    }
  ];

  if (!shouldSkipAiSetupForLanguage(state.language)) {
    steps.push({
      id: "modelSource",
      title: wizardMessage(locale, "modelSourceTitle"),
      hint: wizardMessage(locale, "modelSourceHint"),
      choices: localizedModelSourceChoices(locale)
    });

    if (state.modelSource === "cloud") {
      const cloudModelChoices = localizedCloudModelChoices(locale, state.provider);
      steps.push({
        id: "provider",
        title: wizardMessage(locale, "providerTitle"),
        hint: wizardMessage(locale, "providerHint"),
        choices: localizedCloudProviderChoices(locale)
      });
      steps.push({
        id: "model",
        title: wizardMessage(locale, "cloudModelTitle"),
        hint: wizardMessage(locale, "cloudModelHint"),
        kind: "choice",
        choices: cloudModelChoices,
        inputMask: false,
        inputValueKey: "model",
        ...(state.cloudModelInputMode
          ? { description: wizardMessage(locale, "customCloudModelDescription") }
          : {})
      });
      steps.push({
        id: "apiKey",
        kind: "input",
        title: wizardMessage(locale, "apiKeyTitle"),
        hint: wizardMessage(locale, "apiKeyHint"),
        choices: [],
        inputMask: false,
        inputValueKey: "apiKey",
        description: wizardMessage(locale, "apiKeyDescription")
      });
    } else {
      steps.push({
        id: "model",
        title: wizardMessage(locale, "localModelTitle"),
        hint: wizardMessage(locale, "localModelHint"),
        choices: localizedLocalModelChoices(locale, localModelChoices),
        ...(localModelGroups ? { choiceGroups: localModelGroups } : {})
      });
    }
  }

  steps.push({
    id: "freshnessDays",
    title: wizardMessage(locale, "freshnessTitle"),
    hint: wizardMessage(locale, "freshnessHint"),
    choices: localizedFreshnessChoices(locale)
  });

  steps.push({
    id: "mobileInstall",
    title: wizardMessage(locale, "mobileInstallTitle"),
    hint: wizardMessage(locale, "mobileInstallHint"),
    choices: localizedMobileInstallChoices(locale)
  });

  return steps;
}

export function applyChoice(state: SetupState, step: SetupStep, choice: ModelChoice, localModelChoices?: ModelChoice[]): SetupState {
  const defaultLocalModel = (localModelChoices ?? availableLocalModelChoices())[0]?.value ?? "qwen2.5:7b";

  switch (step.id) {
    case "language":
      return applyLanguageToSetupState(state, choice.value);
    case "modelSource":
      return choice.value === "local"
        ? { ...state, modelSource: "local", provider: "local", model: defaultLocalModel, cloudModelInputMode: false, apiKey: "" }
        : {
            ...state,
            modelSource: "cloud",
            provider: "openai",
            cloudModelInputMode: false,
            model: localizedCloudModelChoices("en", "openai")[0]?.value ?? DEFAULT_OPENAI_MODEL
          };
    case "provider":
      return {
        ...state,
        provider: choice.value,
        cloudModelInputMode: false,
        apiKey: "",
        model: localizedCloudModelChoices("en", choice.value)[0]?.value ?? state.model
      };
    case "model":
      return { ...state, model: choice.value, cloudModelInputMode: false };
    case "freshnessDays":
      return { ...state, freshnessDays: Number.parseInt(choice.value, 10) as SetupState["freshnessDays"] };
    case "mobileInstall":
      return {
        ...state,
        mobileInstall: choice.value === "install" ? "install" : "skip"
      };
    case "mobilePlatform":
      return {
        ...state,
        mobilePlatform: choice.value === "ios" ? "ios" : "android"
      };
    default:
      return state;
  }
}

export function currentChoiceIndex(step: SetupStep, state: SetupState): number {
  if (step.id === "model" && state.cloudModelInputMode) {
    return Math.max(0, step.choices.length - 1);
  }

  const currentValue = step.id === "freshnessDays" ? String(state.freshnessDays) : state[step.id];
  const index = step.choices.findIndex((choice) => choice.value === currentValue);
  return index >= 0 ? index : 0;
}

export function visibleChoiceWindow<T>(items: T[], selectedIndex: number, maxVisible: number): VisibleChoiceWindow<T> {
  if (items.length <= maxVisible) {
    return {
      items,
      startIndex: 0,
      hasHiddenAbove: false,
      hasHiddenBelow: false
    };
  }

  const half = Math.floor(maxVisible / 2);
  const maxStart = items.length - maxVisible;
  const startIndex = Math.max(0, Math.min(selectedIndex - half, maxStart));

  return {
    items: items.slice(startIndex, startIndex + maxVisible),
    startIndex,
    hasHiddenAbove: startIndex > 0,
    hasHiddenBelow: startIndex + maxVisible < items.length
  };
}

export async function yieldToUi(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function stripTrailingDots(text: string): string {
  return text.replace(/\.{1,3}$/, "");
}

export function withAnimatedDots(text: string, dots: string): string {
  return `${stripTrailingDots(text)}${dots}`;
}
