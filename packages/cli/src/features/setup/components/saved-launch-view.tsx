import React, { useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import type { AppConfig } from "@techbrief/shared";
import { Section } from "../../../components/section.js";
import { StatusRow } from "./setup-status-row.js";
import { statusRowContentWidth } from "../layout.js";
import { stripTrailingDots } from "../helpers.js";
import { useTerminalSize } from "../hooks/use-terminal-size.js";
import { wizardPanelHeight, wizardSectionWidth } from "../layout.js";
import { SetupLaunchWizard } from "./setup-launch-wizard.js";
import type { LaunchOptions } from "../../../app/launch-options.js";
import { detectWizardLocale, wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import { shouldShowAiSummary } from "../translation-mode.js";
import type { SetupState } from "../types.js";
import { isWizardLocale } from "../types.js";

interface SavedLaunchViewProps {
  config: AppConfig;
  initialState: SetupState;
  launchOptions: LaunchOptions;
}

export function SavedLaunchView({
  config,
  initialState,
  launchOptions
}: SavedLaunchViewProps): React.ReactElement {
  const { rows, columns } = useTerminalSize();
  const width = wizardSectionWidth(columns);
  const height = wizardPanelHeight(rows);
  const locale: WizardLocale = isWizardLocale(initialState.language)
    ? initialState.language
    : detectWizardLocale();
  const [enterSetup, setEnterSetup] = useState(false);
  const contentWidth = statusRowContentWidth(width);
  const summaryLines = useMemo(() => buildSummaryLines(config, locale), [config, locale]);

  useInput((_, key) => {
    if (key.return) {
      setEnterSetup(true);
    }
  });

  if (enterSetup) {
    return <SetupLaunchWizard launchOptions={launchOptions} initialState={initialState} />;
  }

  return (
    <Section title={wizardMessage(locale, "launchTitle")} width={width} height={height} bordered={false} showTitle={false}>
      <Text color="yellow">{wizardMessage(locale, "launchReadyHint")}</Text>
      <Box marginTop={0} flexDirection="column">
        {summaryLines.map((line, index) => (
          <StatusRow
            key={`saved-config-${index}`}
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="green"
            text={stripTrailingDots(line)}
            textColor="green"
          />
        ))}
      </Box>
      <Text color="yellow">{wizardMessage(locale, "launchReadyNav")}</Text>
      <Text color="gray">{wizardMessage(locale, "launchSetupHint")}</Text>
    </Section>
  );
}

function buildSummaryLines(config: AppConfig, locale: WizardLocale): string[] {
  const mobileEnabled = config.mobile.android.enabled || config.mobile.ios.enabled;
  const showAiSummary = shouldShowAiSummary(config.app.defaultLanguage);

  return [
    `${wizardMessage(locale, "defaultLanguage")}: ${config.app.defaultLanguage}`,
    ...(showAiSummary
      ? [
          `${wizardMessage(locale, "modelSource")}: ${config.ai.modelSource}`,
          `${wizardMessage(locale, "aiProvider")}: ${config.ai.provider}`,
          `${wizardMessage(locale, "aiModel")}: ${config.ai.model}`
        ]
      : []),
    `${wizardMessage(locale, "freshnessDays")}: ${config.app.freshnessDays}`,
    `${wizardMessage(locale, "mobileInstallStatus")}: ${wizardMessage(locale, mobileEnabled ? "mobileInstallEnabledStatus" : "mobileInstallSkippedStatus")}`
  ];
}
