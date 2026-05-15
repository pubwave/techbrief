import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../../components/section.js";
import {
  statusRowContentWidth,
  visibleOutputLineCount,
  wrapStatusText
} from "../layout.js";
import { stripTrailingDots, withAnimatedDots } from "../helpers.js";
import { StatusRow } from "./setup-status-row.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type {
  ArticleProcessingProgress,
  ArticleProcessingState,
  DeviceInstallState,
  ProgressLine
} from "../types.js";
import { SetupArticleProcessingView } from "./setup-article-processing-view.js";

interface SetupSavingViewProps {
  articleProcessingProgress: ArticleProcessingProgress;
  articleProcessingStates: ArticleProcessingState[];
  installMessage: string | null;
  deviceInstallStates: DeviceInstallState[];
  locale: WizardLocale;
  outputLines: ProgressLine[];
  progressLines: ProgressLine[];
  savingDots: string;
  statusText: string;
  width: number;
  rows: number;
  height: number;
}

export function SetupSavingView({
  articleProcessingProgress,
  articleProcessingStates,
  installMessage,
  deviceInstallStates,
  locale,
  outputLines,
  progressLines,
  rows,
  savingDots,
  statusText,
  width,
  height
}: SetupSavingViewProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const syncFeedLabel = stripTrailingDots(wizardMessage(locale, "progressSyncFeed"));
  const visibleProgressLines = (
    statusText === wizardMessage(locale, "progressPrepareMobile")
      ? progressLines.slice(-1)
      : progressLines
  );
  const currentProgressText = visibleProgressLines.at(-1)?.text ?? "";
  const isSyncFeedStage = stripTrailingDots(currentProgressText).startsWith(syncFeedLabel);
  const showArticleProcessing = !isSyncFeedStage
    && (articleProcessingProgress.total > 0 || articleProcessingStates.length > 0);
  const progressRowCount = visibleProgressLines.reduce((total, line, index) => {
    const suffixText = index === visibleProgressLines.length - 1 ? "" : " ✅";
    const visibleText = index === visibleProgressLines.length - 1
      ? withAnimatedDots(line.text, savingDots)
      : line.text;
    const firstLineWidth = Math.max(8, contentWidth - suffixText.length);
    return total + wrapStatusText(visibleText, firstLineWidth, contentWidth).length;
  }, 0);
  const reservedDeviceRows = deviceInstallStates.reduce((total, state) => total + 1 + Math.min(6, state.outputLines.length), 0);
  const outputRowBudget = visibleOutputLineCount(rows, progressRowCount + reservedDeviceRows, Boolean(installMessage));
  const wrappedOutputLines = outputLines.flatMap((line) =>
    wrapStatusText(line.text, contentWidth, contentWidth).map((segment) => ({
      text: segment,
      color: line.color
    }))
  );
  const visibleOutputLines = wrappedOutputLines.slice(-outputRowBudget);

  return (
    <Section title={wizardMessage(locale, "setupTitle")} width={width} height={height} bordered={false} showTitle={false}>
      <Text color="yellow">{stripTrailingDots(statusText)}</Text>
      {visibleProgressLines.length > 0 ? (
        <Box marginTop={0} flexDirection="column">
          {visibleProgressLines.map((line, index) => (
            index === visibleProgressLines.length - 1 ? (
              <StatusRow
                key={`progress-${index}`}
                contentWidth={contentWidth}
                prefix="›"
                prefixColor="yellow"
                text={withAnimatedDots(line.text, savingDots)}
                textColor="yellow"
              />
            ) : (
              <StatusRow
                key={`progress-${index}`}
                contentWidth={contentWidth}
                prefix="·"
                prefixColor="green"
                text={stripTrailingDots(line.completedText ?? line.text)}
                textColor="green"
                suffix="✅"
                suffixColor="green"
              />
            )
          ))}
        </Box>
      ) : null}
      {outputLines.length > 0 && (articleProcessingProgress.total === 0 || isSyncFeedStage) ? (
        <Box marginTop={0} flexDirection="column">
          {visibleOutputLines.map((line, index) => (
            <StatusRow
              key={`output-${index}`}
              contentWidth={contentWidth}
              prefix="│"
              prefixColor="gray"
              text={line.text}
              textColor={line.color ?? "cyan"}
            />
          ))}
        </Box>
      ) : null}
      {showArticleProcessing ? (
        <SetupArticleProcessingView
          contentWidth={contentWidth}
          locale={locale}
          progress={articleProcessingProgress}
          states={articleProcessingStates}
        />
      ) : null}
      {deviceInstallStates.length > 0 ? (
        <Box marginTop={0} flexDirection="column">
          {deviceInstallStates.map((state) => (
            <Box key={state.deviceId} flexDirection="column" marginTop={1}>
              <StatusRow
                contentWidth={contentWidth}
                prefix={state.status === "failed" ? "!" : state.status === "completed" ? "·" : "›"}
                prefixColor={state.status === "failed" ? "red" : state.status === "completed" ? "green" : "yellow"}
                text={state.label}
                textColor={state.status === "failed" ? "red" : state.status === "completed" ? "green" : "yellow"}
                {...(state.status === "completed"
                  ? { suffix: "✅", suffixColor: "green" as const }
                  : {})}
              />
              {state.outputLines.slice(-6).map((line, index) => (
                <StatusRow
                  key={`${state.deviceId}-output-${index}`}
                  contentWidth={contentWidth}
                  prefix="│"
                  prefixColor="gray"
                  text={line.text}
                  textColor={line.color ?? "cyan"}
                />
              ))}
              {state.status === "failed" && state.detail ? (
                <StatusRow
                  contentWidth={contentWidth}
                  prefix="│"
                  prefixColor="red"
                  text={state.detail}
                  textColor="red"
                />
              ) : null}
            </Box>
          ))}
        </Box>
      ) : null}
      {installMessage ? <Text color="yellow">{installMessage}</Text> : null}
    </Section>
  );
}
