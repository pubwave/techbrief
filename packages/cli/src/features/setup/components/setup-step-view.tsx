import React from "react";
import { PlainChoiceList } from "./setup-choice-list.js";
import { SetupMobileInstallDescription } from "./setup-mobile-install-description.js";
import { SetupStepShell } from "./setup-step-shell.js";
import { SetupTextInput } from "./setup-text-input.js";
import type { WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { SetupState, SetupStep } from "../types.js";

interface SetupStepViewProps {
  compactMode: boolean;
  currentStep: SetupStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  locale: WizardLocale;
  maxVisibleRows: number;
  selectedIndex: number;
  state: SetupState;
  stepIndex: number;
  stepsLength: number;
  width: number;
  height: number;
}

export function SetupStepView(input: SetupStepViewProps): React.ReactElement {
  const {
    compactMode,
    currentStep,
    isFirstStep,
    isLastStep,
    locale,
    maxVisibleRows,
    selectedIndex,
    state,
    stepIndex,
    stepsLength,
    width,
    height
  } = input;

  const showInlineModelInput = currentStep.id === "model" && state.modelSource === "cloud" && state.cloudModelInputMode;
  const description = showInlineModelInput
    ? currentStep.description ?? ""
    : currentStep.kind === "input"
      ? currentStep.description ?? ""
      : currentStep.choices[selectedIndex]?.description ?? "";
  const inputValue = currentStep.inputValueKey === "model"
    ? state.model
    : state.apiKey;

  return (
    <SetupStepShell
      compactMode={compactMode}
      kind="choice"
      locale={locale}
      title={currentStep.title}
      hint={currentStep.hint}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      stepIndex={stepIndex}
      stepsLength={stepsLength}
      width={width}
      height={height}
      {...(currentStep.id === "mobileInstall" && selectedIndex >= 0 && currentStep.choices[selectedIndex]?.value === "install"
        ? {
            descriptionNode: (
              <SetupMobileInstallDescription
                description={description}
                width={width}
              />
            )
          }
        : { description })}
    >
      {showInlineModelInput ? (
        <>
          <PlainChoiceList
            currentStep={currentStep}
            locale={locale}
            selectedIndex={selectedIndex}
            width={width}
            maxVisibleRows={Math.max(1, maxVisibleRows - 1)}
          />
          <SetupTextInput value={inputValue} width={width} masked={false} />
        </>
      ) : currentStep.kind === "input"
        ? <SetupTextInput value={inputValue} width={width} masked={currentStep.inputMask === true} />
        : (
            <PlainChoiceList
              currentStep={currentStep}
              locale={locale}
              selectedIndex={selectedIndex}
              width={width}
              maxVisibleRows={maxVisibleRows}
            />
          )}
    </SetupStepShell>
  );
}
