import React, { useMemo, useState } from "react";
import { useAnimatedDots } from "../hooks/use-animated-dots.js";
import { wizardPanelHeight, wizardSectionWidth, wizardStepVisibleRowCount } from "../layout.js";
import { useTerminalSize } from "../hooks/use-terminal-size.js";
import { useLocalModelCatalog } from "../hooks/use-local-model-catalog.js";
import { buildSteps, currentChoiceIndex } from "../helpers.js";
import { createDefaultSetupState } from "../default-state.js";
import {
  SetupDoneView,
  SetupErrorView,
  SetupMobileDeviceChoiceView,
  SetupMobileRetryView,
  SetupSavingView,
  SetupStepView
} from "./setup-launch-wizard-views.js";
import { useSetupLaunch } from "../hooks/use-setup-launch.js";
import { useSetupLaunchWizardInput } from "../hooks/use-setup-launch-wizard-input.js";
import {
  detectWizardLocale,
  wizardMessage,
  type WizardLocale
} from "../../../shared/i18n/wizard/index.js";
import type {
  LaunchResultState,
  MobileDeviceChoiceState,
  MobileRetryState,
  SetupLaunchWizardProps,
  SetupPhase,
  SetupState
} from "../types.js";
import { isWizardLocale } from "../types.js";
import { isInstalledLocalModelChoice } from "../local-model-selection-actions.js";

export function SetupLaunchWizard({ launchOptions, initialState }: SetupLaunchWizardProps): React.ReactElement {
  const { rows, columns } = useTerminalSize();
  const detectedLocale = detectWizardLocale();
  const [state, setState] = useState<SetupState>(() => initialState ?? createDefaultSetupState(detectedLocale));
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<SetupPhase>("setup");
  const [launchResult, setLaunchResult] = useState<LaunchResultState | null>(null);
  const [mobileDeviceChoiceState, setMobileDeviceChoiceState] = useState<MobileDeviceChoiceState | null>(null);
  const [mobileDeviceCursorIndex, setMobileDeviceCursorIndex] = useState(0);
  const [mobileRetryState, setMobileRetryState] = useState<MobileRetryState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const locale: WizardLocale = isWizardLocale(state.language) ? state.language : detectedLocale;
  const savingDots = useAnimatedDots(phase === "saving" || phase === "mobileRetrySaving" || phase === "mobileDeviceSaving");
  const { catalog: localModelCatalog, refreshLocalModelCatalog } = useLocalModelCatalog();
  const localModelChoices = localModelCatalog.choices;
  const localModelGroups = localModelCatalog.groups;

  const steps = useMemo(
    () => buildSteps(state, locale, localModelChoices, localModelGroups),
    [locale, localModelChoices, localModelGroups, state]
  );
  const currentStep = steps[stepIndex] ?? steps[0]!;
  const selectedIndex = currentChoiceIndex(currentStep, state);
  const deviceChoiceCursorIndex = mobileDeviceChoiceState
    ? Math.max(0, Math.min(mobileDeviceCursorIndex, mobileDeviceChoiceState.devices.length - 1))
    : 0;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex >= steps.length - 1;
  const compactMode = rows < 18;
  const sectionWidth = wizardSectionWidth(columns);
  const panelHeight = wizardPanelHeight(rows);
  const showInlineModelInput = currentStep.id === "model" && state.modelSource === "cloud" && state.cloudModelInputMode;
  const selectedChoice = currentStep.choices[selectedIndex];
  const showLocalModelDeleteNav = currentStep.id === "model"
    && state.modelSource === "local"
    && isInstalledLocalModelChoice(selectedChoice);
  const navigationText = [
    wizardMessage(locale, currentStep.kind === "input" || showInlineModelInput ? "inputNav" : "chooseNav"),
    ...(showLocalModelDeleteNav ? [wizardMessage(locale, "deleteNav")] : []),
    wizardMessage(locale, currentStep.kind === "input" || showInlineModelInput ? "inputContinueNav" : "continueNav"),
    ...(isFirstStep
      ? []
      : [wizardMessage(locale, currentStep.kind === "input" || showInlineModelInput ? "inputBackNav" : "backNav")])
  ].join(", ");
  const maxVisibleRows = wizardStepVisibleRowCount({
    panelHeight,
    sectionWidth,
    compactMode,
    title: currentStep.title,
    hint: currentStep.hint,
    description: showInlineModelInput
      ? currentStep.description ?? ""
      : currentStep.kind === "input"
      ? currentStep.description ?? ""
      : currentStep.choices[selectedIndex]?.description ?? "",
    navigationText
  });
  const {
    articleProcessingProgress,
    articleProcessingStates,
    deviceInstallStates,
    progressLines,
    outputLines
  } = useSetupLaunch({
    phase,
    launchOptions,
    locale,
    mobileDeviceChoiceState,
    mobileRetryState,
    state,
    setPhase,
    setMobileDeviceChoiceState,
    setLaunchResult,
    setMobileRetryState,
    setError,
    setInstallMessage
  });

  useSetupLaunchWizardInput({
    currentStep,
    deviceChoiceCursorIndex,
    isLastStep,
    launchOptions,
    launchResult,
    localModelChoices,
    mobileDeviceChoiceState,
    mobileRetryState,
    phase,
    locale,
    refreshLocalModelCatalog,
    selectedIndex,
    setInstallMessage,
    setMobileDeviceChoiceState,
    setMobileDeviceCursorIndex,
    setMobileRetryState,
    setPhase,
    setState,
    setStepIndex,
    showInlineModelInput,
    state
  });

  if (phase === "saving" || phase === "mobileRetrySaving" || phase === "mobileDeviceSaving") {
    return (
      <SetupSavingView
        articleProcessingProgress={articleProcessingProgress}
        articleProcessingStates={articleProcessingStates}
        deviceInstallStates={deviceInstallStates}
        installMessage={installMessage}
        locale={locale}
        outputLines={outputLines}
        progressLines={progressLines}
        rows={rows}
        savingDots={savingDots}
        statusText={phase === "saving"
          ? wizardMessage(locale, "setupSaving")
          : deviceInstallStates.length > 0
          ? wizardMessage(locale, "progressMobileInstallDevice")
          : wizardMessage(locale, "progressPrepareMobile")}
        height={panelHeight}
        width={sectionWidth}
      />
    );
  }

  if (phase === "error") {
    return <SetupErrorView error={error} locale={locale} progressLines={progressLines} width={sectionWidth} height={panelHeight} />;
  }

  if (phase === "mobileDeviceChoice" && mobileDeviceChoiceState) {
    return (
      <SetupMobileDeviceChoiceView
        cursorIndex={deviceChoiceCursorIndex}
        devices={mobileDeviceChoiceState.devices}
        height={panelHeight}
        locale={locale}
        selectedDeviceIds={mobileDeviceChoiceState.selectedDeviceIds}
        width={sectionWidth}
      />
    );
  }

  if (phase === "mobileRetry" && mobileRetryState) {
    return (
      <SetupMobileRetryView
        locale={locale}
        rows={rows}
        steps={mobileRetryState.steps}
        width={sectionWidth}
        height={panelHeight}
        {...(mobileRetryState.retryGuideKind !== undefined
          ? { retryGuideKind: mobileRetryState.retryGuideKind }
          : {})}
        {...(mobileRetryState.requiresXcodeSigningHelp !== undefined
          ? { requiresXcodeSigningHelp: mobileRetryState.requiresXcodeSigningHelp }
          : {})}
        {...(mobileRetryState.xcodeOpened !== undefined
          ? { xcodeOpened: mobileRetryState.xcodeOpened }
          : {})}
      />
    );
  }

  if (phase === "done" && launchResult) {
    return <SetupDoneView installMessage={installMessage} launchResult={launchResult} locale={locale} state={state} width={sectionWidth} height={panelHeight} />;
  }

  return (
    <SetupStepView
      compactMode={compactMode}
      currentStep={currentStep}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      locale={locale}
      selectedIndex={selectedIndex}
      state={state}
      stepIndex={stepIndex}
      stepsLength={steps.length}
      maxVisibleRows={maxVisibleRows}
      height={panelHeight}
      width={sectionWidth}
    />
  );
}
