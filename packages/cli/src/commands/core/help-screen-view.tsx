import React, { useMemo, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Section } from "../../components/section.js";
import { setSelectedCommand } from "../../app/selected-command.js";
import { type CommandValidationIssue } from "../../app/command-validation.js";
import { HELP_COMMAND_SPECS } from "../../app/command-spec.js";
import { useTerminalSize } from "../../features/setup/hooks/use-terminal-size.js";
import {
  padStatusText,
  statusRowContentWidth,
  wizardPanelHeight,
  wizardSectionWidth,
  wrapStatusText
} from "../../features/setup/layout.js";
import { visibleChoiceWindow } from "../../features/setup/helpers.js";
import {
  detectWizardLocale,
  wizardDescription,
  formatWizardMessage,
  wizardMessage
} from "../../shared/i18n/wizard/index.js";

interface HelpScreenViewProps {
  issue?: CommandValidationIssue;
}

interface HelpRow {
  key: string;
  kind: "group" | "item";
  text: string;
  commandText?: string;
  description?: string;
  selectable: boolean;
}

export function HelpScreenView({ issue }: HelpScreenViewProps): React.ReactElement {
  const { exit } = useApp();
  const { rows, columns } = useTerminalSize();
  const locale = detectWizardLocale();
  const width = wizardSectionWidth(columns);
  const height = wizardPanelHeight(rows);
  const contentWidth = statusRowContentWidth(width);
  const helpRows = useMemo(() => buildHelpRows(locale), [locale]);
  const selectableRows = useMemo(
    () => helpRows.filter((row) => row.selectable),
    [helpRows]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRowKey = selectableRows[selectedIndex]?.key;
  const selectedRowIndex = Math.max(0, helpRows.findIndex((row) => row.key === selectedRowKey));
  const visibleRows = visibleChoiceWindow(helpRows, selectedRowIndex, Math.max(6, height - 14));
  const selectedDescription = selectableRows[selectedIndex]?.description ?? "";
  const wrappedDescription = wrapStatusText(selectedDescription, contentWidth, contentWidth).slice(0, 3);

  useInput((_, key) => {
    if (key.return) {
      const selectedCommandText = selectableRows[selectedIndex]?.commandText;
      if (selectedCommandText) {
        setSelectedCommand(selectedCommandText);
      }
      exit();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((current) => (
        current <= 0 ? selectableRows.length - 1 : current - 1
      ));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((current) => (
        current >= selectableRows.length - 1 ? 0 : current + 1
      ));
    }
  });

  return (
    <Section
      title={wizardMessage(locale, "helpTitle")}
      width={width}
      height={height}
      bordered={false}
      showTitle={false}
    >
      <Box flexDirection="column" flexGrow={1}>
        {issue ? (
          <Text color="yellow">
            {issue.type === "option"
              ? formatWizardMessage(locale, "helpUnknownOption", { option: issue.value })
              : formatWizardMessage(locale, "helpUnknownCommand", { command: issue.value })}
          </Text>
        ) : null}
        <Box marginTop={issue ? 1 : 0} flexDirection="column" flexGrow={1}>
          {visibleRows.hasHiddenAbove ? <Text color="gray">{padStatusText("↑", contentWidth)}</Text> : null}
          {visibleRows.items.map((row) => (
            <Text
              key={row.key}
              {...(() => {
                const color = row.kind === "group"
                  ? "cyan"
                  : row.key === selectedRowKey
                    ? "green"
                    : undefined;
                return color ? { color } : {};
              })()}
            >
              {padStatusText(
                row.kind === "group"
                  ? row.text
                  : row.key === selectedRowKey
                    ? `› ${row.text}`
                    : `  ${row.text}`,
                contentWidth
              )}
            </Text>
          ))}
          {visibleRows.hasHiddenBelow ? <Text color="gray">{padStatusText("↓", contentWidth)}</Text> : null}
        </Box>
        <Box marginTop={1} flexDirection="column" flexShrink={0}>
          {wrappedDescription.map((line, index) => (
            <Text key={`help-description-${index}`} color="gray">
              {line}
            </Text>
          ))}
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text color="yellow">
            {wizardMessage(locale, "chooseNav")}, {wizardMessage(locale, "continueNav")}.
          </Text>
        </Box>
      </Box>
    </Section>
  );
}

function buildHelpRows(locale: ReturnType<typeof detectWizardLocale>): HelpRow[] {
  return [
    {
      key: "group-commands",
      kind: "group",
      text: wizardMessage(locale, "helpCommands"),
      selectable: false
    },
    ...HELP_COMMAND_SPECS.map((line) => ({
      key: `command-${line.commandText}`,
      kind: "item" as const,
      text: line.line,
      commandText: line.commandText,
      description: wizardDescription(locale, line.descriptionKey),
      selectable: true
    }))
  ];
}
