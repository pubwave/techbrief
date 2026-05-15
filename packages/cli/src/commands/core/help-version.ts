import React from "react";
import { Text } from "ink";
import { HELP_COMMAND_SPECS } from "../../app/command-spec.js";
import { CLI_VERSION } from "../../app/cli-version.js";
import { HelpScreenView } from "./help-screen-view.js";
import {
  detectWizardLocale,
  formatWizardMessage,
  wizardMessage
} from "../../shared/i18n/wizard/index.js";
import { createLine, createSection } from "../../shared/ui/ui.js";
import type { CommandValidationIssue } from "../../app/command-validation.js";

export function helpView(issue?: CommandValidationIssue): React.ReactElement {
  const locale = detectWizardLocale();
  const lines = [];

  if (issue?.type === "option") {
    lines.push(createLine(formatWizardMessage(locale, "helpUnknownOption", { option: issue.value }), "yellow", "help-issue-option"));
  } else if (issue?.type === "command") {
    lines.push(createLine(formatWizardMessage(locale, "helpUnknownCommand", { command: issue.value }), "yellow", "help-issue-command"));
  }

  lines.push(createLine(wizardMessage(locale, "helpCommands"), "cyan", "help-commands"));
  for (const command of HELP_COMMAND_SPECS) {
    lines.push(createLine(command.line, undefined, `help-command-${command.commandText}`));
  }

  return createSection(wizardMessage(locale, "helpTitle"), lines);
}

export function helpScreenView(issue?: CommandValidationIssue): React.ReactElement {
  return React.createElement(HelpScreenView, issue ? { issue } : {});
}

export function versionView(): React.ReactElement {
  const locale = detectWizardLocale();
  return React.createElement(Text, { color: "green" }, `${wizardMessage(locale, "versionLabel")}: ${CLI_VERSION}`);
}
