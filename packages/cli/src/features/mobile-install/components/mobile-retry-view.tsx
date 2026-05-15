import React from "react";
import { Box } from "ink";
import { Section } from "../../../components/section.js";
import { StatusRow } from "../../setup/components/setup-status-row.js";
import {
  statusRowContentWidth,
  visibleOutputLineCount,
  wrapStatusText
} from "../../setup/layout.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { LaunchStep } from "../../setup/types.js";

interface SetupMobileRetryViewProps {
  locale: WizardLocale;
  rows: number;
  steps: LaunchStep[];
  retryGuideKind?: "ios-signing" | "ios-xcode-missing" | "ios-cocoapods-missing" | "android-tools-missing";
  xcodeOpened?: boolean;
  requiresXcodeSigningHelp?: boolean;
  width: number;
  height: number;
}

export function SetupMobileRetryView({
  locale,
  rows,
  steps,
  retryGuideKind,
  xcodeOpened,
  requiresXcodeSigningHelp,
  width,
  height
}: SetupMobileRetryViewProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const title = wizardMessage(locale, "mobileRetryTitle");
  const retryAction = retryGuideKind === "ios-signing"
    ? wizardMessage(locale, xcodeOpened ? "mobileRetryActionContinueAfterXcode" : "mobileRetryActionOpenXcode")
    : retryGuideKind === "ios-xcode-missing"
    ? wizardMessage(locale, xcodeOpened ? "mobileRetryActionContinueAfterInstall" : "mobileRetryActionOpenAppStore")
    : wizardMessage(locale, "mobileRetryActionRetry");
  const skipAction = wizardMessage(locale, "mobileRetryActionSkip");
  const failedSteps = simplifyFailedSteps(steps);
  const guideKey = retryGuideKind === "ios-signing"
    ? "mobileSigningGuide"
    : retryGuideKind === "ios-xcode-missing"
    ? "mobileXcodeInstallGuide"
    : retryGuideKind === "ios-cocoapods-missing"
    ? "mobileCocoapodsGuide"
    : retryGuideKind === "android-tools-missing"
    ? "mobileAndroidToolsGuide"
    : null;
  const signingGuideRows = guideKey
    ? wizardMessage(locale, guideKey)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    : [];
  const rowBudget = visibleOutputLineCount(rows, 5, false);
  const wrappedRows = failedSteps.flatMap((step, index) =>
    wrapStatusText(step.detail, contentWidth, contentWidth).map((segment, segmentIndex) => ({
      key: `${index}-${segmentIndex}`,
      prefix: " ",
      text: segment,
      color: "red" as const
    }))
  ).slice(0, Math.max(1, rowBudget));

  return (
    <Section title={title} width={width} height={height} bordered={false} showTitle={false}>
      <Box flexDirection="column">
        {wrappedRows.map((row) => (
          <StatusRow
            key={row.key}
            contentWidth={contentWidth}
            prefix={row.prefix}
            prefixColor={row.color}
            text={row.text}
            textColor={row.color}
          />
        ))}
        {signingGuideRows.length > 0 ? (
          <Box marginTop={1} flexDirection="column">
            {signingGuideRows.map((line, index) => (
              <StatusRow
                key={`guide-${index}`}
                contentWidth={contentWidth}
                prefix="·"
                prefixColor="yellow"
                text={line}
                textColor="yellow"
              />
            ))}
          </Box>
        ) : null}
        <Box marginTop={1} flexDirection="column">
          <StatusRow
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="yellow"
            text={retryAction}
            textColor="yellow"
          />
          <StatusRow
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="yellow"
            text={skipAction}
            textColor="yellow"
          />
        </Box>
      </Box>
    </Section>
  );
}

function simplifyFailedSteps(steps: LaunchStep[]): LaunchStep[] {
  const failedSteps = steps.filter((step) => !step.ok);
  const seenDetails = new Set<string>();

  return failedSteps.filter((step) => {
    if (seenDetails.has(step.detail)) {
      return false;
    }

    seenDetails.add(step.detail);
    return true;
  });
}
