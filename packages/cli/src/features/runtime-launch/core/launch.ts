import path from "node:path";
import { markInitialSyncCompleted, markInitialSyncFailed, markInitialSyncStarted } from "@techbrief/runtime";
import { ensureDetachedProcessStopped, ensurePortFree } from "../../../shared/process/process.js";
import { registerSessionCleanupTask } from "../../../shared/process/session-cleanup.js";
import { processFiles, runtimeRoot as resolveRuntimeRoot } from "../../../shared/paths/runtime-paths.js";
import { resolveCliAppHome } from "../../../shared/paths/app-home.js";
import { ensureRuntimeWorkspace } from "../../../shared/runtime/runtime-workspace.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import { launchLocale, resolveServeSchedulerScriptPath, resolveServeWebScriptPath, yieldToUi } from "./helpers.js";
import { runPostLaunchStages } from "../post/post-launch.js";
import { launchServiceWithHealth, startRuntimeService } from "../services/service-launch.js";
import { runInitialSyncStage } from "../sync/sync-stage.js";
import type { LaunchHandle, LaunchInput, LaunchResult, LaunchStep } from "./types.js";

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

export async function prepareLaunchTechBrief(input: LaunchInput): Promise<LaunchHandle> {
  const locale = launchLocale(input);
  const appHome = resolveCliAppHome();
  const apiPort = input.apiPort ?? 9541;
  const webPort = input.webPort ?? 9540;
  const host = input.host ?? "127.0.0.1";
  const apiUrl = `http://${host}:${apiPort}`;
  const webUrl = `http://${host}:${webPort}`;

  input.onProgress?.("prepare-runtime");
  await yieldToUi();
  const runtime = await ensureRuntimeWorkspace({
    runtimeRoot: resolveRuntimeRoot(),
    onProgress: () => {},
    ...(input.templateUrl ? { templateUrl: input.templateUrl } : {})
  });
  const steps: LaunchStep[] = [...runtime.steps];

  if (!runtime.ok) {
    const sync = { ok: false, detail: wizardMessage(locale, "launchSyncSkippedRuntime") };
    return {
      ok: false,
      apiUrl,
      webUrl,
      runtimeRoot: runtime.runtimeRoot,
      workspaceDir: runtime.workspaceDir,
      sync,
      steps,
      startServices: async () =>
        createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtime.runtimeRoot, workspaceDir: runtime.workspaceDir, sync, steps })
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
  await ensurePortFree(apiPort);
  await ensurePortFree(webPort);

  await markInitialSyncStarted(locale);

  let syncResult: LaunchResult["sync"];
  try {
    syncResult = await runInitialSyncStage(locale, input, steps);
    if (syncResult.ok) {
      await markInitialSyncCompleted(locale);
    } else {
      await markInitialSyncFailed(locale, syncResult.detail);
    }
  } catch (error) {
    await markInitialSyncFailed(locale, error instanceof Error ? error.message : "Unexpected sync error");
    throw error;
  }

  const serviceState = { started: false, failed: false };

  async function startServices(): Promise<LaunchResult> {
    if (serviceState.started || serviceState.failed) {
      return createLaunchResult({
        ok: serviceState.started,
        apiUrl,
        webUrl,
        runtimeRoot: runtime.runtimeRoot,
        workspaceDir: runtime.workspaceDir,
        sync: syncResult,
        steps
      });
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
    if (apiLaunch.healthStep) steps.push(apiLaunch.healthStep);
    if (sessionMode && apiLaunch.startStep.ok) registerSessionCleanupTask(apiLaunch.cleanup);
    if (!apiLaunch.startStep.ok || !apiLaunch.ok) {
      serviceState.failed = true;
      await apiLaunch.cleanup();
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtime.runtimeRoot, workspaceDir: runtime.workspaceDir, sync: syncResult, steps });
    }

    const schedulerLaunch = await startRuntimeService({
      command: process.execPath,
      args: [resolveServeSchedulerScriptPath()],
      cwd: process.cwd(),
      env: { TECHBRIEF_HOME: appHome },
      pidFile: schedulerPidFile,
      logFile: schedulerFiles.logFile,
      url: "scheduler",
      session: sessionMode
    });
    steps.push({ label: "scheduler", ok: schedulerLaunch.ok, detail: schedulerLaunch.detail });
    if (sessionMode && schedulerLaunch.ok) registerSessionCleanupTask(schedulerLaunch.cleanup);
    if (!schedulerLaunch.ok) {
      serviceState.failed = true;
      await schedulerLaunch.cleanup();
      await apiLaunch.cleanup();
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtime.runtimeRoot, workspaceDir: runtime.workspaceDir, sync: syncResult, steps });
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
    if (webLaunch.healthStep) steps.push(webLaunch.healthStep);
    if (sessionMode && webLaunch.startStep.ok) registerSessionCleanupTask(webLaunch.cleanup);
    if (!webLaunch.startStep.ok || !webLaunch.ok) {
      serviceState.failed = true;
      await webLaunch.cleanup();
      await schedulerLaunch.cleanup();
      await apiLaunch.cleanup();
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtime.runtimeRoot, workspaceDir: runtime.workspaceDir, sync: syncResult, steps });
    }

    serviceState.started = true;

    await runPostLaunchStages({
      locale,
      launchInput: { ...input, noOpen: true, noMobile: true },
      apiUrl,
      webUrl,
      steps
    });

    return createLaunchResult({
      ok: steps.every((step) => step.ok),
      apiUrl,
      webUrl,
      runtimeRoot: runtime.runtimeRoot,
      workspaceDir: runtime.workspaceDir,
      sync: syncResult,
      steps
    });
  }

  return {
    ok: syncResult.ok,
    apiUrl,
    webUrl,
    runtimeRoot: runtime.runtimeRoot,
    workspaceDir: runtime.workspaceDir,
    sync: syncResult,
    steps,
    startServices
  };
}

export async function launchTechBrief(input: LaunchInput): Promise<LaunchResult> {
  const handle = await prepareLaunchTechBrief(input);
  if (!handle.ok) {
    return createLaunchResult({
      ok: false,
      apiUrl: handle.apiUrl,
      webUrl: handle.webUrl,
      runtimeRoot: handle.runtimeRoot,
      workspaceDir: handle.workspaceDir,
      sync: handle.sync,
      steps: handle.steps
    });
  }
  const result = await handle.startServices();
  if (!result.ok) return result;

  await runPostLaunchStages({
    locale: launchLocale(input),
    launchInput: input,
    apiUrl: result.apiUrl,
    webUrl: result.webUrl,
    steps: result.steps
  });

  return result;
}
