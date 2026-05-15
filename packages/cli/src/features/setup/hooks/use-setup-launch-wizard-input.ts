import type { Dispatch, SetStateAction } from "react";
import { useInput } from "ink";
import type { ModelChoice } from "../../local-model/index.js";
import { openBrowser, openPath } from "../../../shared/browser/browser.js";
import { applyChoice } from "../helpers.js";
import { isInstalledLocalModelChoice, removeLocalModelSelection } from "../local-model-selection-actions.js";
import type {
  LaunchOptions,
  LaunchResultState,
  MobileDeviceChoiceState,
  MobileRetryState,
  SetupPhase,
  SetupState,
  SetupStep
} from "../types.js";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";

interface UseSetupLaunchWizardInput {
  currentStep: SetupStep;
  deviceChoiceCursorIndex: number;
  isLastStep: boolean;
  launchOptions: LaunchOptions;
  launchResult: LaunchResultState | null;
  localModelChoices: ModelChoice[];
  mobileDeviceChoiceState: MobileDeviceChoiceState | null;
  mobileRetryState: MobileRetryState | null;
  phase: SetupPhase;
  locale: WizardLocale;
  refreshLocalModelCatalog: () => void;
  selectedIndex: number;
  setInstallMessage: (message: string | null) => void;
  setMobileDeviceChoiceState: Dispatch<SetStateAction<MobileDeviceChoiceState | null>>;
  setMobileDeviceCursorIndex: Dispatch<SetStateAction<number>>;
  setMobileRetryState: Dispatch<SetStateAction<MobileRetryState | null>>;
  setPhase: Dispatch<SetStateAction<SetupPhase>>;
  setState: Dispatch<SetStateAction<SetupState>>;
  setStepIndex: Dispatch<SetStateAction<number>>;
  showInlineModelInput: boolean;
  state: SetupState;
}

export function useSetupLaunchWizardInput(input: UseSetupLaunchWizardInput): void {
  useInput((value, key) => {
    if (input.phase === "mobileDeviceChoice") {
      handleMobileDeviceChoiceInput(input, value, key);
      return;
    }

    if (input.phase === "mobileRetry") {
      handleMobileRetryInput(input, key);
      return;
    }

    if (input.phase !== "setup") {
      return;
    }

    if (input.showInlineModelInput) {
      handleInlineModelInput(input, value, key);
      return;
    }

    handleSetupInput(input, value, key);
  });
}

function handleMobileDeviceChoiceInput(
  input: UseSetupLaunchWizardInput,
  value: string,
  key: Parameters<Parameters<typeof useInput>[0]>[1]
): void {
  if (!input.mobileDeviceChoiceState) {
    return;
  }

  if (key.leftArrow && input.launchResult) {
    if (input.launchOptions.noOpen !== true) {
      openBrowser(input.launchResult.webUrl);
    }
    input.setMobileDeviceChoiceState(null);
    input.setPhase("done");
    return;
  }

  if (key.upArrow) {
    input.setMobileDeviceCursorIndex((previous) => (
      previous <= 0 ? input.mobileDeviceChoiceState!.devices.length - 1 : previous - 1
    ));
    return;
  }

  if (key.downArrow) {
    input.setMobileDeviceCursorIndex((previous) => (
      previous >= input.mobileDeviceChoiceState!.devices.length - 1 ? 0 : previous + 1
    ));
    return;
  }

  if (value === " ") {
    const device = input.mobileDeviceChoiceState.devices[input.deviceChoiceCursorIndex];
    if (!device) {
      return;
    }

    input.setMobileDeviceChoiceState((previous) => previous
      ? {
          ...previous,
          selectedDeviceIds: previous.selectedDeviceIds.includes(device.id)
            ? previous.selectedDeviceIds.filter((deviceId) => deviceId !== device.id)
            : [...previous.selectedDeviceIds, device.id]
        }
      : previous);
    return;
  }

  if (key.return && input.mobileDeviceChoiceState.selectedDeviceIds.length > 0) {
    input.setPhase("mobileDeviceSaving");
  }
}

function handleMobileRetryInput(
  input: UseSetupLaunchWizardInput,
  key: Parameters<Parameters<typeof useInput>[0]>[1]
): void {
  if (key.leftArrow && input.launchResult) {
    if (input.launchOptions.noOpen !== true) {
      openBrowser(input.launchResult.webUrl);
    }
    input.setMobileRetryState(null);
    input.setPhase("done");
    return;
  }

  if (!key.return) {
    return;
  }

  if (input.mobileRetryState?.retryGuideKind === "ios-xcode-missing" && !input.mobileRetryState.xcodeOpened) {
    openBrowser("macappstore://itunes.apple.com/app/id497799835");
    input.setMobileRetryState({
      ...input.mobileRetryState,
      xcodeOpened: true
    });
    return;
  }

  if (
    input.mobileRetryState?.requiresXcodeSigningHelp
    && !input.mobileRetryState.xcodeOpened
    && input.mobileRetryState.xcodeWorkspacePath
  ) {
    openPath(input.mobileRetryState.xcodeWorkspacePath, "Xcode");
    input.setMobileRetryState({
      ...input.mobileRetryState,
      xcodeOpened: true
    });
    return;
  }

  input.setInstallMessage(null);
  input.setPhase("mobileRetrySaving");
}

function handleInlineModelInput(
  input: UseSetupLaunchWizardInput,
  value: string,
  key: Parameters<Parameters<typeof useInput>[0]>[1]
): void {
  if (key.upArrow) {
    input.setState((previous) => ({
      ...previous,
      cloudModelInputMode: false
    }));
    return;
  }

  if (key.backspace || key.delete) {
    input.setState((previous) => ({
      ...previous,
      model: previous.model.slice(0, -1)
    }));
    return;
  }

  if (key.return) {
    if (input.state.model.trim().length === 0) {
      return;
    }

    input.setState((previous) => ({
      ...previous,
      model: previous.model.trim()
    }));

    if (input.isLastStep) {
      input.setPhase("saving");
    } else {
      input.setStepIndex((previous) => previous + 1);
    }
    return;
  }

  if (!key.ctrl && !key.meta && !key.escape && value.length > 0) {
    input.setState((previous) => ({
      ...previous,
      model: `${previous.model}${value}`
    }));
  }
}

function handleSetupInput(
  input: UseSetupLaunchWizardInput,
  value: string,
  key: Parameters<Parameters<typeof useInput>[0]>[1]
): void {
  if (
    key.delete
    && input.currentStep.id === "model"
    && input.state.modelSource === "local"
  ) {
    const selectedChoice = input.currentStep.choices[input.selectedIndex];
    if (!isInstalledLocalModelChoice(selectedChoice)) {
      return;
    }
    if (!selectedChoice) {
      return;
    }

    const result = removeLocalModelSelection(selectedChoice.value, input.locale);
    input.refreshLocalModelCatalog();
    input.setInstallMessage(null);
    input.setState((previous) => ({
      ...previous,
      model: previous.model === selectedChoice.value ? result.nextModel : previous.model
    }));
    return;
  }

  if (key.upArrow) {
    if (input.currentStep.kind === "input") {
      return;
    }
    const nextIndex = input.selectedIndex <= 0 ? input.currentStep.choices.length - 1 : input.selectedIndex - 1;
    const nextChoice = input.currentStep.choices[nextIndex];
    if (nextChoice) {
      input.setState((previous) => applyChoice(previous, input.currentStep, nextChoice, input.localModelChoices));
    }
    return;
  }

  if (key.downArrow) {
    if (
      input.currentStep.id === "model"
      && input.state.modelSource === "cloud"
      && !input.state.cloudModelInputMode
      && input.selectedIndex >= input.currentStep.choices.length - 1
    ) {
      input.setState((previous) => ({
        ...previous,
        cloudModelInputMode: true,
        model: ""
      }));
      return;
    }

    if (input.currentStep.kind === "input") {
      return;
    }
    const nextIndex = input.selectedIndex >= input.currentStep.choices.length - 1 ? 0 : input.selectedIndex + 1;
    const nextChoice = input.currentStep.choices[nextIndex];
    if (nextChoice) {
      input.setState((previous) => applyChoice(previous, input.currentStep, nextChoice, input.localModelChoices));
    }
    return;
  }

  if (key.leftArrow) {
    input.setStepIndex((previous) => (previous > 0 ? previous - 1 : previous));
    return;
  }

  if (key.return) {
    if (input.currentStep.kind === "input") {
      const inputValue = input.currentStep.inputValueKey === "model" ? input.state.model : input.state.apiKey;
      if (inputValue.trim().length === 0) {
        return;
      }
    }

    if (input.isLastStep) {
      input.setPhase("saving");
    } else {
      input.setStepIndex((previous) => previous + 1);
    }
    return;
  }

  if (input.currentStep.kind !== "input") {
    return;
  }

  if (key.backspace || key.delete) {
    input.setState((previous) => ({
      ...previous,
      ...(input.currentStep.inputValueKey === "model"
        ? { model: previous.model.slice(0, -1) }
        : { apiKey: previous.apiKey.slice(0, -1) })
    }));
    return;
  }

  if (!key.ctrl && !key.meta && !key.escape && value.length > 0) {
    input.setState((previous) => ({
      ...previous,
      ...(input.currentStep.inputValueKey === "model"
        ? { model: `${previous.model}${value}` }
        : { apiKey: `${previous.apiKey}${value}` })
    }));
  }
}
