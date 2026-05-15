import path from "node:path";
import { markInitialSyncCompleted, markInitialSyncFailed, markInitialSyncStarted } from "@techbrief/runtime";
import { ensureDetachedProcessStopped } from "../../../shared/process/process.js";
import { registerSessionCleanupTask } from "../../../shared/process/session-cleanup.js";
import { processFiles, runtimeRoot as resolveRuntimeRoot } from "../../../shared/paths/runtime-paths.js";
import { resolveCliAppHome } from "../../../shared/paths/app-home.js";
import { ensureRuntimeWorkspace } from "../../../shared/runtime/runtime-workspace.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import { launchLocale, resolveServeSchedulerScriptPath, resolveServeWebScriptPath, yieldToUi } from "./helpers.js";
import { runPostLaunchStages } from "../post/post-launch.js";
import { launchServiceWithHealth, startRuntimeService } from "../services/service-launch.js";
import { runInitialSyncStage } from "../sync/sync-stage.js";
import type { LaunchInput, LaunchResult, LaunchStep } from "./types.js";

function createLaunchResult(input: {
  ok: boolean;
  apiUrl: string;
  webUrl: string;
  runtimeRoot: string;
  workspaceDir: string;
  sync: LaunchResult["sync"];
  steps: LaunchStep[];
}): LaunchResult {
  return {
    ok: input.ok,
    apiUrl: input.apiUrl,
    webUrl: input.webUrl,
    runtimeRoot: input.runtimeRoot,
    workspaceDir: input.workspaceDir,
    sync: input.sync,
    steps: input.steps
  };
}
export async function launchTechBrief(input: LaunchInput): Promise<LaunchResult> {
  const locale = launchLocale(input);
  const appHome = resolveCliAppHome();
  const apiPort = input.apiPort ?? 4310;
  const webPort = input.webPort ?? 4320;
  const host = input.host ?? "127.0.0.1";
  const apiUrl = `http://${host}:${apiPort}`;
  const webUrl = `http://${host}:${webPort}`;
  input.onProgress?.("prepare-runtime");
  await yieldToUi();
  const runtime = await ensureRuntimeWorkspace({
    runtimeRoot: resolveRuntimeRoot(),
    onProgress: () => {
      // Runtime workspace work still belongs to the single prepare-runtime stage.
    },
    ...(input.templateUrl ? { templateUrl: input.templateUrl } : {})
  });
  const steps: LaunchResult["steps"] = [...runtime.steps];

  if (!runtime.ok) {
    return {
      ...createLaunchResult({
        ok: false,
        apiUrl,
        webUrl,
        runtimeRoot: runtime.runtimeRoot,
        workspaceDir: runtime.workspaceDir,
        sync: {
          ok: false,
          detail: wizardMessage(locale, "launchSyncSkippedRuntime")
        },
        steps
      })
    };
  }

  const apiFiles = processFiles("api");
  const webFiles = processFiles("web");
  const schedulerFiles = processFiles("scheduler");
  const apiPidFile = apiFiles.pidFile;
  const webPidFile = webFiles.pidFile;
  const schedulerPidFile = schedulerFiles.pidFile;
  const sessionMode = input.session === true;

  input.onProgress?.("stop-old-services");
  await yieldToUi();
  await ensureDetachedProcessStopped(apiPidFile);
  await ensureDetachedProcessStopped(webPidFile);
  await ensureDetachedProcessStopped(schedulerPidFile);

  await markInitialSyncStarted(locale);

  const serviceState = {
    started: false,
    failed: false,
    apiCleanup: async () => {
      await ensureDetachedProcessStopped(apiPidFile);
    },
    webCleanup: async () => {
      await ensureDetachedProcessStopped(webPidFile);
    },
    schedulerCleanup: async () => {
      await ensureDetachedProcessStopped(schedulerPidFile);
    }
  };

  const ensureServicesStarted = async (): Promise<void> => {
    if (serviceState.started || serviceState.failed) {
      return;
    }

    input.onProgress?.("start-api");
    await yieldToUi();
    const apiLaunch = await launchServiceWithHealth({
      name: "api",
      command: process.execPath,
      args: [path.join(runtime.workspaceDir, "apps/server/dist/index.js")],
      cwd: process.cwd(),
      env: {
        HOST: host,
        PORT: String(apiPort),
        TECHBRIEF_HOME: appHome
      },
      pidFile: apiPidFile,
      logFile: apiFiles.logFile,
      url: apiUrl,
      healthUrl: `${apiUrl}/health`,
      locale,
      session: sessionMode
    });
    steps.push(apiLaunch.startStep);
    if (apiLaunch.healthStep) {
      steps.push(apiLaunch.healthStep);
    }
    serviceState.apiCleanup = apiLaunch.cleanup;
    if (sessionMode && apiLaunch.startStep.ok) {
      registerSessionCleanupTask(apiLaunch.cleanup);
    }
    if (!apiLaunch.startStep.ok || !apiLaunch.ok) {
      serviceState.failed = true;
      await apiLaunch.cleanup();
      return;
    }

    const schedulerLaunch = await startRuntimeService({
      command: process.execPath,
      args: [resolveServeSchedulerScriptPath()],
      cwd: process.cwd(),
      env: {
        TECHBRIEF_HOME: appHome
      },
      pidFile: schedulerPidFile,
      logFile: schedulerFiles.logFile,
      url: "scheduler",
      session: sessionMode
    });
    steps.push({
      label: "scheduler",
      ok: schedulerLaunch.ok,
      detail: schedulerLaunch.detail
    });
    serviceState.schedulerCleanup = schedulerLaunch.cleanup;
    if (sessionMode && schedulerLaunch.ok) {
      registerSessionCleanupTask(schedulerLaunch.cleanup);
    }
    if (!schedulerLaunch.ok) {
      serviceState.failed = true;
      await schedulerLaunch.cleanup();
      await apiLaunch.cleanup();
      return;
    }

    input.onProgress?.("start-web");
    await yieldToUi();
    const webLaunch = await launchServiceWithHealth({
      name: "web",
      command: process.execPath,
      args: [resolveServeWebScriptPath()],
      cwd: process.cwd(),
      env: {
        HOST: host,
        PORT: String(webPort),
        TECHBRIEF_HOME: appHome,
        TECHBRIEF_API_BASE_URL: apiUrl,
        TECHBRIEF_WEB_DIST: path.join(runtime.workspaceDir, "apps/web/dist")
      },
      pidFile: webPidFile,
      logFile: webFiles.logFile,
      url: webUrl,
      healthUrl: webUrl,
      locale,
      session: sessionMode
    });
    steps.push(webLaunch.startStep);
    if (webLaunch.healthStep) {
      steps.push(webLaunch.healthStep);
    }
    serviceState.webCleanup = webLaunch.cleanup;
    if (sessionMode && webLaunch.startStep.ok) {
      registerSessionCleanupTask(webLaunch.cleanup);
    }
    if (!webLaunch.startStep.ok || !webLaunch.ok) {
      serviceState.failed = true;
      await webLaunch.cleanup();
      await schedulerLaunch.cleanup();
      await apiLaunch.cleanup();
      return;
    }

    serviceState.started = true;
    await input.onServicesReady?.({
      apiUrl,
      webUrl,
      runtimeRoot: runtime.runtimeRoot,
      workspaceDir: runtime.workspaceDir
    });
  };

  try {
    const syncResult = await runInitialSyncStage(locale, input, steps);

    if (!serviceState.started) {
      await ensureServicesStarted();
    }

    if (syncResult.ok) {
      await markInitialSyncCompleted(locale);
    } else {
      await markInitialSyncFailed(locale, syncResult.detail);
    }

    if (serviceState.failed) {
      return createLaunchResult({
        ok: false,
        apiUrl,
        webUrl,
        runtimeRoot: runtime.runtimeRoot,
        workspaceDir: runtime.workspaceDir,
        sync: syncResult,
        steps
      });
    }

    const mobileInstallOk = await runPostLaunchStages({
      locale,
      launchInput: input,
      apiUrl,
      webUrl,
      steps
    });

    return createLaunchResult({
      ok: steps.every((step) => step.ok) && mobileInstallOk,
      apiUrl,
      webUrl,
      runtimeRoot: runtime.runtimeRoot,
      workspaceDir: runtime.workspaceDir,
      sync: syncResult,
      steps
    });
  } catch (error) {
    await markInitialSyncFailed(locale, error instanceof Error ? error.message : "Unexpected launch error");
    throw error;
  }
}
