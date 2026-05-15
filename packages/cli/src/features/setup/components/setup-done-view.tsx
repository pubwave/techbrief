import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../../components/section.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { shouldShowAiSummary } from "../translation-mode.js";
import type { LaunchResultState, SetupState } from "../types.js";

interface SetupDoneViewProps {
  installMessage: string | null;
  launchResult: LaunchResultState;
  locale: WizardLocale;
  state: SetupState;
  width: number;
  height: number;
}

export function SetupDoneView({
  installMessage,
  launchResult,
  locale,
  state,
  width,
  height
}: SetupDoneViewProps): React.ReactElement {
  const showAiSummary = shouldShowAiSummary(state.language);

  return (
    <Box flexDirection="column">
      <Section title={wizardMessage(locale, "setupComplete")} width={width} height={height} bordered={false} showTitle={false}>
        <Text color="green">{wizardMessage(locale, "defaultLanguage")}: {state.language}</Text>
        {showAiSummary ? <Text color="green">{wizardMessage(locale, "modelSource")}: {state.modelSource}</Text> : null}
        {showAiSummary ? <Text color="green">{wizardMessage(locale, "aiModel")}: {state.model}</Text> : null}
        <Text color="green">{wizardMessage(locale, "freshnessDays")}: {state.freshnessDays}</Text>
        {installMessage ? <Text color="yellow">{installMessage}</Text> : null}
        <Text color={launchResult.ok ? "green" : "yellow"}>
          {launchResult.ok ? wizardMessage(locale, "launchCompleted") : wizardMessage(locale, "launchCompletedErrors")}
        </Text>
      </Section>
    </Box>
  );
}
