import React from "react";
import type { AppViewResult } from "./app-view-result.js";
import { parseCommand } from "./parse-command.js";
import { validateCommandInput } from "./command-validation.js";
import { parseLaunchOptions } from "./launch-options.js";
import { configGetView, configSetView, initView } from "../commands/config/index.js";
import { doctorView, helpScreenView, helpView, startupView, versionView } from "../commands/core/index.js";
import { modelLocalInstallView, modelLocalListView, modelLocalUninstallView, modelLocalUseView } from "../commands/model/index.js";
import { scheduleGetView, scheduleSetView } from "../commands/schedule/index.js";
import { sourceAddView, sourceListView, sourceStateView, sourceValidateView } from "../commands/source/index.js";

export async function buildAppView(argv: string[]): Promise<AppViewResult> {
  const parsed = parseCommand(argv);
  const command = parsed.command.join(" ");
  const validation = validateCommandInput(command, parsed.options);
  const interactiveTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (validation.kind === "help") {
    return {
      view: interactiveTerminal ? helpScreenView(validation.issue) : helpView(validation.issue),
      useAlternateScreen: interactiveTerminal
    };
  }

  if (validation.kind === "version") {
    return {
      view: versionView(),
      useAlternateScreen: false
    };
  }

  const launchOptions = parseLaunchOptions(parsed.options);

  const startup = await startupView(command, parsed.options, launchOptions);
  if (startup) {
    return {
      view: startup,
      useAlternateScreen: command === "" || command === "setup"
    };
  }

  switch (command) {
    case "init":
      return { view: await initView(parsed.options), useAlternateScreen: false };
    case "config get":
      return { view: await configGetView(), useAlternateScreen: false };
    case "config set":
      return { view: await configSetView(parsed.options), useAlternateScreen: false };
    case "model local install":
      return { view: await modelLocalInstallView(parsed.options), useAlternateScreen: false };
    case "model local list":
      return { view: await modelLocalListView(), useAlternateScreen: false };
    case "model local use":
      return { view: await modelLocalUseView(parsed.options), useAlternateScreen: false };
    case "model local uninstall":
      return { view: await modelLocalUninstallView(parsed.options), useAlternateScreen: false };
    case "source list":
      return { view: await sourceListView(), useAlternateScreen: false };
    case "source validate":
      return { view: await sourceValidateView(parsed.options), useAlternateScreen: false };
    case "source add":
      return { view: await sourceAddView(parsed.options), useAlternateScreen: false };
    case "source enable":
      return { view: await sourceStateView("active", parsed.options), useAlternateScreen: false };
    case "source disable":
      return { view: await sourceStateView("disabled", parsed.options), useAlternateScreen: false };
    case "schedule get":
      return { view: await scheduleGetView(), useAlternateScreen: false };
    case "schedule set":
      return { view: await scheduleSetView(parsed.options), useAlternateScreen: false };
    case "doctor":
      return { view: await doctorView(), useAlternateScreen: false };
    default:
      return { view: await helpView(), useAlternateScreen: false };
  }
}
