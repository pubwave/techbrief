import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../../components/section.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";

interface SetupStepShellProps {
  compactMode: boolean;
  locale: WizardLocale;
  kind?: "choice" | "input";
  title: string;
  hint?: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepIndex: number;
  stepsLength: number;
  width: number;
  height: number;
  children: React.ReactNode;
  description?: string;
  descriptionNode?: React.ReactNode;
}

export function SetupStepShell(input: SetupStepShellProps): React.ReactElement {
  const {
    compactMode,
    locale,
    kind = "choice",
    title,
    hint,
    isFirstStep,
    isLastStep,
    stepIndex,
    stepsLength,
    width,
    height,
    children,
    description,
    descriptionNode
  } = input;
  const contentSpacing = compactMode ? 0 : 1;
  const navigationText = [
    wizardMessage(locale, kind === "input" ? "inputNav" : "chooseNav"),
    wizardMessage(locale, kind === "input" ? "inputContinueNav" : "continueNav"),
    ...(isFirstStep ? [] : [wizardMessage(locale, kind === "input" ? "inputBackNav" : "backNav")])
  ].join(", ");

  return (
    <Section title={wizardMessage(locale, "firstRunTitle")} width={width} height={height} bordered={false} showTitle={false}>
      <Box flexShrink={0}>
        <Text color="cyanBright">{wizardMessage(locale, "stepLabel")} {stepIndex + 1} / {stepsLength}</Text>
      </Box>
      <Box marginTop={contentSpacing} flexDirection="column" flexShrink={0}>
        <Text>{title}</Text>
        {hint ? <Text color="gray">{hint}</Text> : null}
      </Box>
      <Box marginTop={contentSpacing} flexDirection="column" flexGrow={1} flexShrink={1}>
        {children}
      </Box>
      {description || descriptionNode
        ? (
            <Box marginTop={contentSpacing} flexDirection="column" flexShrink={0}>
              {descriptionNode ?? <Text color="gray">{description}</Text>}
            </Box>
          )
        : null}
      <Box marginTop={contentSpacing} flexDirection="column" flexShrink={0}>
        <Text color="yellow">{navigationText}.</Text>
      </Box>
    </Section>
  );
}
