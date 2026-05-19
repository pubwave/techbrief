import React from "react";
import { runFeedSync } from "@techbrief/feed";
import { countStoredArticles } from "@techbrief/runtime";
import { DEFAULT_APP_CONFIG } from "@techbrief/shared";
import { runDoctorChecks } from "../../shared/runtime/doctor.js";
import { formatDockerComposeCommand, runDockerCompose } from "../../shared/runtime/docker.js";
import { ensureFlutterTool } from "../../features/mobile-install/workflow/flutter-sdk.js";
import { appendSyncLogEntry, launchTechBrief, runtimeServiceStatus, stopRuntimeServices } from "../../features/runtime-launch/index.js";
import { commandResultLines } from "../../shared/process/command-results.js";
import { type LaunchOptions } from "../../pubwave-launch-options.js";
import { detectWizardLocale, wizardMessage } from "../../shared/i18n/wizard/index.js";
import { createLine, createSection } from "../../shared/ui/ui.js";
import { formatCommand, mobileAppRoot, runCommand, workspaceRoot } from "../../shared/paths/workspace.js";

export function doctorView(): React.ReactElement {
  const checks = runDoctorChecks();
  return createSection("Doctor", [
    ...checks.map((check) =>
      createLine(`${check.ok ? "OK" : "MISS"} ${check.label}: ${check.detail}`, check.ok ? "green" : "yellow", check.label)
    ),
    createLine(`Default schedule: every ${DEFAULT_APP_CONFIG.schedule.intervalHours} hours`, "cyan"),
    createLine("Public-content mode: no login required", "yellow")
  ]);
}

export async function installView(): Promise<React.ReactElement> {
  const rootInstall = runCommand("npm", ["install"], workspaceRoot);
  const flutterTool = await ensureFlutterTool();
  const mobileInstall = flutterTool.ok
    ? runCommand(flutterTool.command, ["pub", "get"], mobileAppRoot)
    : {
        ok: false,
        stderr: flutterTool.detail
      };
  const allOk = rootInstall.ok && flutterTool.ok && mobileInstall.ok;

  return createSection("Install", [
    ...commandResultLines(formatCommand("npm", ["install"]), rootInstall),
    ...(flutterTool.ok
      ? [createLine(`OK Flutter: ${flutterTool.detail}`, "green")]
      : [createLine(`FAIL Flutter: ${flutterTool.detail}`, "yellow")]),
    ...commandResultLines(formatCommand(flutterTool.ok ? flutterTool.command : "flutter", ["pub", "get"]), mobileInstall),
    createLine(
      allOk ? "Install flow completed for workspace and mobile app." : "Install flow completed with warnings.",
      allOk ? "cyan" : "yellow"
    )
  ]);
}

export async function upView(): Promise<React.ReactElement> {
  return createSection("Up", [
    createLine("Use `techbrief launch` or just `techbrief` to start the local product flow.", "green"),
    createLine("Web opens in the browser and API runs in the background.", "cyan"),
    createLine("Mobile install is handled as a separate last step in setup, or with `techbrief mobile run ...` later.", "cyan")
  ]);
}

export async function launchView(options: LaunchOptions): Promise<React.ReactElement> {
  const result = await launchTechBrief(options);
  const locale = detectWizardLocale();
  const syncNoticeLines = result.sync.ok
    ? []
    : [
        createLine(wizardMessage(locale, "launchSyncFailedNotice"), "yellow", "launch-sync-notice"),
        createLine(wizardMessage(locale, "launchSyncFailedAction"), "yellow", "launch-sync-action"),
        createLine(`${wizardMessage(locale, "launchSyncFailedDetail")} ${result.sync.detail}`, "red", "launch-sync-detail")
      ];

  return createSection("Launch", [
    createLine(`API: ${result.apiUrl}`),
    createLine(`Web: ${result.webUrl}`),
    createLine(`Runtime root: ${result.runtimeRoot}`, "cyan"),
    createLine(`Workspace: ${result.workspaceDir}`, "cyan"),
    ...syncNoticeLines,
    ...result.steps.map((step, index) =>
      createLine(`${step.ok ? "OK" : "FAIL"} ${step.label}: ${step.detail}`, step.ok ? "green" : "red", `launch-${index}`)
    ),
    createLine(
      result.ok ? "TechBrief launch flow completed." : "TechBrief launch flow completed with errors.",
      result.ok ? "green" : "yellow"
    )
  ]);
}

export async function statusView(): Promise<React.ReactElement> {
  const services = await runtimeServiceStatus();

  return createSection("Status", services.flatMap((service, index) => [
    createLine(
      `${service.running ? "RUNNING" : service.exists ? "STOPPED" : "MISS"} ${service.name}${service.pid ? ` (pid ${service.pid})` : ""}`,
      service.running ? "green" : service.exists ? "yellow" : "red",
      `status-${index}`
    ),
    ...(service.tail.length > 0
      ? [createLine(service.tail.at(-1) ?? "", "cyan", `status-tail-${index}`)]
      : [createLine("No log output captured yet.", "yellow", `status-empty-${index}`)])
  ]));
}

export async function downView(): Promise<React.ReactElement> {
  const stopped = await stopRuntimeServices();

  return createSection("Down", stopped.map((service, index) =>
    createLine(`${service.ok ? "OK" : "FAIL"} ${service.name}: ${service.detail}`, service.ok ? "green" : "red", `down-${index}`)
  ));
}

export async function logsView(): Promise<React.ReactElement> {
  const services = await runtimeServiceStatus();

  return createSection("Logs", services.flatMap((service, index) => [
    createLine(`[${service.name}]`, "cyan", `logs-label-${index}`),
    ...(service.tail.length > 0
      ? service.tail.map((line, lineIndex) => createLine(line, undefined, `logs-${index}-${lineIndex}`))
      : [createLine("No log lines found.", "yellow", `logs-empty-${index}`)])
  ]));
}

export async function buildWorkspaceView(): Promise<React.ReactElement> {
  const webBuild = runCommand("npm", ["run", "build"], workspaceRoot);
  const flutterTool = await ensureFlutterTool();
  const mobileAnalyze = flutterTool.ok
    ? runCommand(flutterTool.command, ["analyze"], mobileAppRoot)
    : {
        ok: false,
        stderr: flutterTool.detail
      };
  const allOk = webBuild.ok && flutterTool.ok && mobileAnalyze.ok;

  return createSection("Build", [
    ...commandResultLines("npm run build", webBuild),
    ...(flutterTool.ok
      ? [createLine(`OK Flutter: ${flutterTool.detail}`, "green")]
      : [createLine(`FAIL Flutter: ${flutterTool.detail}`, "yellow")]),
    ...commandResultLines(formatCommand(flutterTool.ok ? flutterTool.command : "flutter", ["analyze"]), mobileAnalyze),
    createLine(
      allOk ? "Web bundle and mobile static checks completed." : "Build flow completed with warnings.",
      allOk ? "cyan" : "yellow"
    )
  ]);
}

export async function webDockerView(action: "up" | "down" | "logs"): Promise<React.ReactElement> {
  const args =
    action === "up"
      ? ["up", "-d", "--build"]
      : action === "down"
        ? ["down"]
        : ["logs", "--tail=80"];
  const result = runDockerCompose(args);

  return createSection(`Web ${action === "up" ? "Up" : action === "down" ? "Down" : "Logs"}`, [
    ...commandResultLines(formatDockerComposeCommand(args), result),
    ...(
      result.stdout
        ? result.stdout
            .split("\n")
            .slice(0, 8)
            .map((line, index) => createLine(line, undefined, `stdout-${index}`))
        : []
    ),
    ...(
      result.stderr
        ? result.stderr
            .split("\n")
            .slice(1, 5)
            .filter(Boolean)
            .map((line, index) => createLine(line, "yellow", `stderr-${index}`))
        : []
    )
  ]);
}


export async function syncView(): Promise<React.ReactElement> {
  try {
    const result = await runFeedSync({
      callbacks: {
        onArticleFiltered: async (entry) => {
          await appendSyncLogEntry({
            phase: "source-skipped",
            sourceId: entry.article.sourceId,
            message: formatFilteredArticleLogMessage(entry)
          });
        },
        onSourceSkipped: async (source, reason) => {
          await appendSyncLogEntry({
            phase: "source-skipped",
            sourceId: source.id,
            message: reason
          });
        }
      }
    });
    const currentArticles = await countStoredArticles();

    return createSection("Sync", [
      createLine(`Fetched sources: ${result.fetchedSources.length}`, "green"),
      createLine(`Skipped sources: ${result.skippedSources.length}`, result.skippedSources.length > 0 ? "yellow" : undefined),
      createLine(`Filtered articles: ${result.filteredArticles.length}`, result.filteredArticles.length > 0 ? "yellow" : undefined),
      createLine(`Fetched articles: ${result.preparedArticles}`, "cyan"),
      createLine(`Saved articles: ${result.savedArticles}`, "cyan"),
      createLine(`Current article store: ${currentArticles}`),
      ...result.skippedSources.slice(0, 5).map((item) =>
        createLine(`- ${item.sourceId}: ${item.reason}`, "yellow", `${item.sourceId}:${item.reason}`)
      )
    ]);
  } catch (error) {
    await appendSyncLogEntry({
      phase: "sync-failed",
      message: error instanceof Error ? error.stack ?? error.message : "Unknown sync error"
    });
    throw error;
  }
}

function formatFilteredArticleLogMessage(entry: {
  reason: string;
  article: { originalUrl: string };
  duplicateOf?: { sourceId: string; originalUrl: string };
}): string {
  const base = `${entry.reason}: ${entry.article.originalUrl}`;
  if (!entry.duplicateOf) {
    return base;
  }

  return `${base}\nduplicate-of: ${entry.duplicateOf.sourceId} | ${entry.duplicateOf.originalUrl}`;
}
