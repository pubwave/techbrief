import React from "react";
import { Box, Text } from "ink";
import { Section } from "../../../components/section.js";
import { statusRowContentWidth } from "../layout.js";
import { stripTrailingDots } from "../helpers.js";
import { StatusRow } from "./setup-status-row.js";
import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { ProgressLine } from "../types.js";

interface SetupErrorViewProps {
  error: string | null;
  locale: WizardLocale;
  progressLines: ProgressLine[];
  width: number;
  height: number;
}

export function SetupErrorView({
  error,
  locale,
  progressLines,
  width,
  height
}: SetupErrorViewProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);

  return (
    <Section title={wizardMessage(locale, "setupTitle")} width={width} height={height} bordered={false} showTitle={false}>
      {progressLines.length > 0 ? (
        <Box marginBottom={0} flexDirection="column">
          {progressLines.map((line, index) => (
            <StatusRow
              key={`error-progress-${index}`}
              contentWidth={contentWidth}
              prefix="·"
              prefixColor="red"
              text={stripTrailingDots(line.text)}
              textColor="red"
            />
          ))}
        </Box>
      ) : null}
      <Text color="red">{wizardMessage(locale, "setupFailed")}: {error ?? wizardMessage(locale, "setupUnknownError")}</Text>
    </Section>
  );
}
