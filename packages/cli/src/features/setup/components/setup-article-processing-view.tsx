import React from "react";
import { Box } from "ink";
import {
  formatWizardMessage,
  wizardMessage,
  type WizardLocale
} from "../../../shared/i18n/wizard/index.js";
import { StatusRow } from "./setup-status-row.js";
import type { ArticleProcessingProgress, ArticleProcessingState } from "../types.js";

interface SetupArticleProcessingViewProps {
  contentWidth: number;
  locale: WizardLocale;
  progress: ArticleProcessingProgress;
  states: ArticleProcessingState[];
}

export function SetupArticleProcessingView({
  contentWidth,
  locale,
  progress,
  states
}: SetupArticleProcessingViewProps): React.ReactElement | null {
  if (progress.total === 0 && states.length === 0) {
    return null;
  }

  return (
    <Box marginTop={0} flexDirection="column">
      {progress.total > 0 ? (
        <Box flexDirection="column">
          <StatusRow
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="cyan"
            text={formatWizardMessage(locale, "articleProcessingTotal", {
              total: String(progress.total)
            })}
            textColor="cyan"
          />
          <StatusRow
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="cyan"
            text={formatWizardMessage(locale, "articleProcessingProcessedCount", {
              processed: String(progress.processed),
              total: String(progress.total)
            })}
            textColor="cyan"
          />
          <StatusRow
            contentWidth={contentWidth}
            prefix="·"
            prefixColor="green"
            text={formatWizardMessage(locale, "articleProcessingSavedCount", {
              saved: String(progress.saved),
              total: String(progress.total)
            })}
            textColor="green"
          />
        </Box>
      ) : null}
      {states.map((state) => (
        <StatusRow
          key={state.id}
          contentWidth={contentWidth}
          prefix={state.status === "saved" ? "·" : state.status === "completed" ? "·" : state.status === "failed" ? "!" : "›"}
          prefixColor={state.status === "saved" ? "green" : state.status === "completed" ? "cyan" : state.status === "failed" ? "red" : "yellow"}
          text={formatWizardMessage(locale, "articleProcessingStateLine", {
            status: resolveArticleStatusLabel(locale, state.status),
            article: state.label
          })}
          textColor={state.status === "failed" ? "red" : "gray"}
          {...(state.status === "saved" ? { suffix: "✅", suffixColor: "green" as const } : {})}
        />
      ))}
    </Box>
  );
}

function resolveArticleStatusLabel(locale: WizardLocale, status: ArticleProcessingState["status"]): string {
  switch (status) {
    case "completed":
      return wizardMessage(locale, "articleProcessingCompleted");
    case "saved":
      return wizardMessage(locale, "articleProcessingSaved");
    case "failed":
      return wizardMessage(locale, "articleProcessingFailed");
    case "processing":
    default:
      return wizardMessage(locale, "articleProcessingProcessing");
  }
}
