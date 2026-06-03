import React from "react";
import { detectWizardLocale, wizardMessage } from "../../shared/i18n/wizard/index.js";
import { createLine, createSection } from "../../shared/ui/ui.js";
import { loadSchedulerViewModel, updateSchedulerPolicy } from "./service.js";

function localizedScheduleMode(locale: ReturnType<typeof detectWizardLocale>, mode: string): string {
  return mode === "cron" ? wizardMessage(locale, "scheduleModeCron") : wizardMessage(locale, "scheduleModeInterval");
}

function localizedScheduleStatus(locale: ReturnType<typeof detectWizardLocale>, status?: "success" | "failed"): string {
  if (status === "success") {
    return wizardMessage(locale, "scheduleStatusSuccess");
  }

  if (status === "failed") {
    return wizardMessage(locale, "scheduleStatusFailed");
  }

  return wizardMessage(locale, "scheduleNone");
}

function formatLocalDateTime(value: string | undefined, locale: ReturnType<typeof detectWizardLocale>): string {
  if (!value) {
    return wizardMessage(locale, "scheduleNone");
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export async function schedulerGetView(): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  const viewModel = await loadSchedulerViewModel();
  const sourceStatusLines = viewModel.sourceStatuses.length > 0
    ? viewModel.sourceStatuses.slice(0, 8).flatMap((item) => [
        createLine(`${wizardMessage(locale, "scheduleSourceStatus")} ${item.sourceId}`, "cyan", `schedule-source-${item.sourceId}`),
        createLine(`${wizardMessage(locale, "scheduleLastRun")} ${formatLocalDateTime(item.lastRunAt, locale)}`),
        createLine(`${wizardMessage(locale, "scheduleLastStatus")} ${localizedScheduleStatus(locale, item.lastStatus)}`),
        ...(item.lastError ? [createLine(`${wizardMessage(locale, "scheduleLastError")} ${item.lastError}`, "yellow")] : [])
      ])
    : [createLine(`${wizardMessage(locale, "scheduleSourceStatus")} ${wizardMessage(locale, "scheduleNone")}`, "yellow")];
  const recentErrorLines = viewModel.recentErrors.length > 0
    ? viewModel.recentErrors.slice(0, 5).map((item, index) =>
        createLine(
          `${formatLocalDateTime(item.runAt, locale)}${item.sourceId ? ` ${item.sourceId}` : ""}: ${item.message}`,
          "yellow",
          `schedule-error-${index}`
        ))
    : [createLine(`${wizardMessage(locale, "scheduleRecentErrors")} ${wizardMessage(locale, "scheduleNone")}`, "yellow")];

  return createSection(wizardMessage(locale, "scheduleTitle"), [
    createLine(`${wizardMessage(locale, "scheduleMode")} ${localizedScheduleMode(locale, viewModel.mode)}`),
    createLine(`${wizardMessage(locale, "scheduleInterval")} ${viewModel.intervalMinutes ?? wizardMessage(locale, "scheduleNone")}`),
    createLine(`${wizardMessage(locale, "scheduleCron")} ${viewModel.cron ?? wizardMessage(locale, "scheduleNone")}`),
    createLine(`${wizardMessage(locale, "scheduleLastRun")} ${formatLocalDateTime(viewModel.globalLastRunAt, locale)}`),
    createLine(`${wizardMessage(locale, "scheduleLastStatus")} ${localizedScheduleStatus(locale, viewModel.globalLastStatus)}`),
    ...(viewModel.globalLastError
      ? [createLine(`${wizardMessage(locale, "scheduleLastError")} ${viewModel.globalLastError}`, "yellow")]
      : []),
    ...sourceStatusLines,
    ...recentErrorLines
  ]);
}

export async function schedulerSetView(options: Record<string, string | boolean>): Promise<React.ReactElement> {
  const locale = detectWizardLocale();
  const result = await updateSchedulerPolicy(options);

  return createSection(wizardMessage(locale, "scheduleUpdatedTitle"), [
    createLine(
      `${wizardMessage(locale, "scheduleMode")} ${result.updatedGlobal ? localizedScheduleMode(locale, result.updatedGlobal.mode) : wizardMessage(locale, "scheduleNone")}`,
      "green"
    ),
    createLine(`${wizardMessage(locale, "scheduleInterval")} ${result.updatedGlobal?.intervalMinutes ?? wizardMessage(locale, "scheduleNone")}`),
    createLine(`${wizardMessage(locale, "scheduleCron")} ${result.updatedGlobal?.cron ?? wizardMessage(locale, "scheduleNone")}`)
  ]);
}
