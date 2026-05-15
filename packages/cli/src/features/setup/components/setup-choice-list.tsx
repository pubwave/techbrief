import React from "react";
import { Box, Text } from "ink";
import { buildChoiceRenderRows } from "../presentation/setup-choice-rows.js";
import { padStatusText, statusRowContentWidth } from "../layout.js";
import { visibleChoiceWindow } from "../helpers.js";
import { type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import type { SetupStep } from "../types.js";

interface ChoiceListProps {
  currentStep: SetupStep;
  locale: WizardLocale;
  selectedIndex: number;
  width: number;
  maxVisibleRows: number;
}

export function PlainChoiceList({
  currentStep,
  locale,
  selectedIndex,
  width,
  maxVisibleRows
}: ChoiceListProps): React.ReactElement {
  const contentWidth = statusRowContentWidth(width);
  const selectedChoiceValue = currentStep.choices[selectedIndex]?.value;
  const rows = buildChoiceRenderRows(currentStep, locale, selectedChoiceValue);
  const selectedRowIndex = Math.max(0, rows.findIndex((row) => row.kind === "choice" && row.choiceValue === selectedChoiceValue));
  const listRowBudget = rows.length > maxVisibleRows ? Math.max(1, maxVisibleRows - 2) : maxVisibleRows;
  const visibleRows = visibleChoiceWindow(rows, selectedRowIndex, listRowBudget);
  const pinnedGroupHeader = findPinnedGroupHeader(rows, visibleRows.startIndex, visibleRows.items[0]?.kind);
  const renderedRows = pinnedGroupHeader
    ? [pinnedGroupHeader, ...visibleRows.items.slice(0, Math.max(0, visibleRows.items.length - 1))]
    : visibleRows.items;

  return (
    <Box flexDirection="column">
      {visibleRows.hasHiddenAbove ? <Text color="gray">{padStatusText("↑", contentWidth)}</Text> : null}
      {renderedRows.map((row) => (
        row.kind === "gap" ? (
          <Box key={row.key} marginTop={1}>
            <Text>{padStatusText("", contentWidth)}</Text>
          </Box>
        ) : (
          <Text key={row.key} {...(row.color ? { color: row.color } : {})}>
            {padStatusText(row.text, contentWidth)}
          </Text>
        )
      ))}
      {visibleRows.hasHiddenBelow ? <Text color="gray">{padStatusText("↓", contentWidth)}</Text> : null}
    </Box>
  );
}

function findPinnedGroupHeader(
  rows: ReturnType<typeof buildChoiceRenderRows>,
  startIndex: number,
  firstVisibleKind: SetupStep["choiceGroups"] extends undefined ? never : "gap" | "group" | "choice" | "state" | undefined
) {
  if (startIndex <= 0 || firstVisibleKind === "group" || firstVisibleKind === "gap") {
    return undefined;
  }

  for (let index = startIndex - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (!row) {
      continue;
    }

    if (row.kind === "group") {
      return row;
    }
  }

  return undefined;
}
