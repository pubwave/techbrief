import path from "node:path";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  isInitialSyncCompleteForConfig,
  isInitialSyncOwnedBy,
  listAllSources,
  loadConfig,
  markInitialSyncCompleted,
  markInitialSyncFailed,
  markSchedulerSourcesRun,
  markInitialSyncStarted
} from "@techbrief/runtime";
import { ensureDetachedProcessStopped, ensurePortFree } from "../../../shared/process/process.js";
import { registerSessionCleanupTask } from "../../../shared/process/session-cleanup.js";
import { processFiles, runtimeRoot as resolveRuntimeRoot } from "../../../shared/paths/runtime-paths.js";
import { resolveCliAppHome } from "../../../shared/paths/app-home.js";
import { wizardMessage } from "../../../shared/i18n/wizard/index.js";
import { launchLocale, resolveServeApiScriptPath, resolveServeSchedulerScriptPath, resolveServeWebScriptPath, resolveWebDistDir, yieldToUi } from "./helpers.js";
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
  // The published CLI ships a prebuilt web client and a bundled API server, so
  // there is no source download or on-machine build — resolve them in-package
  // (falling back to the local monorepo build when running from source).
  const runtimeRoot = resolveRuntimeRoot();
  const apiScript = resolveServeApiScriptPath();
  const webDist = resolveWebDistDir();
  const workspaceDir = path.dirname(webDist);
  const assetsReady = existsSync(apiScript) && existsSync(path.join(webDist, "index.html"));
  const steps: LaunchStep[] = [{
    label: "assets",
    ok: assetsReady,
    detail: assetsReady ? "Using bundled web and API assets." : "Bundled web/API assets were not found."
  }];

  if (!assetsReady) {
    const sync = { ok: false, detail: wizardMessage(locale, "launchSyncSkippedRuntime") };
    return {
      ok: false,
      apiUrl,
      webUrl,
      runtimeRoot,
      workspaceDir,
      sync,
      steps,
      startServices: async () =>
        createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot, workspaceDir, sync, steps })
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

  let syncResult: LaunchResult["sync"];
  const config = await loadConfig();
  const initialSyncComplete = await isInitialSyncCompleteForConfig(config);
  if (initialSyncComplete) {
    syncResult = { ok: true, detail: wizardMessage(locale, "launchSyncCompleted") };
  } else {
    const syncOwnerId = randomUUID();
    await markInitialSyncStarted(locale, syncOwnerId);

    try {
      syncResult = await runInitialSyncStage(locale, input, steps, {
        shouldContinue: () => isInitialSyncOwnedBy(syncOwnerId)
      });
      if (syncResult.ok) {
        await markInitialSyncCompleted(locale, syncOwnerId);
        await markActiveSourcesScheduled(new Date().toISOString());
      } else if (!syncResult.superseded) {
        await markInitialSyncFailed(locale, syncResult.detail, syncOwnerId);
      }
    } catch (error) {
      await markInitialSyncFailed(locale, error instanceof Error ? error.message : "Unexpected sync error", syncOwnerId);
      throw error;
    }
  }

  const serviceState = { started: false, failed: false };

  async function startServices(): Promise<LaunchResult> {
    if (serviceState.started || serviceState.failed) {
      return createLaunchResult({
        ok: serviceState.started,
        apiUrl,
        webUrl,
        runtimeRoot: runtimeRoot,
        workspaceDir: workspaceDir,
        sync: syncResult,
        steps
      });
    }

    input.onProgress?.("start-api");
    await yieldToUi();
    const apiLaunch = await launchServiceWithHealth({
      name: "api",
      command: process.execPath,
      args: [apiScript],
      cwd: process.cwd(),
      env: {
        // Bind the API on the LAN IP so mobile devices can reach it. Do NOT set
        // OLLAMA_HOST: the API server is co-located with the local model, so it
        // inherits the CLI's env and reaches Ollama over loopback (127.0.0.1),
        // the same way the scheduler does. Forcing the LAN IP here pointed the
        // server at an address where the 127.0.0.1-bound Ollama isn't listening,
        // so translations never reached the model and failed language validation.
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
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtimeRoot, workspaceDir: workspaceDir, sync: syncResult, steps });
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
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtimeRoot, workspaceDir: workspaceDir, sync: syncResult, steps });
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
        API_BASE_URL: apiUrl,
        TECHBRIEF_WEB_DIST: webDist
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
      return createLaunchResult({ ok: false, apiUrl, webUrl, runtimeRoot: runtimeRoot, workspaceDir: workspaceDir, sync: syncResult, steps });
    }

    serviceState.started = true;

    await runPostLaunchStages({
      locale,
      launchInput: { ...input, noOpen: true },
      apiUrl,
      webUrl,
      steps
    });

    return createLaunchResult({
      ok: steps.every((step) => step.ok),
      apiUrl,
      webUrl,
      runtimeRoot: runtimeRoot,
      workspaceDir: workspaceDir,
      sync: syncResult,
      steps
    });
  }

  return {
    ok: syncResult.ok,
    apiUrl,
    webUrl,
    runtimeRoot: runtimeRoot,
    workspaceDir: workspaceDir,
    sync: syncResult,
    steps,
    startServices
  };
}

async function markActiveSourcesScheduled(runAt: string): Promise<void> {
  const sources = (await listAllSources()).filter((source) => source.state === "enabled");
  if (sources.length === 0) {
    return;
  }

  await markSchedulerSourcesRun(sources.map((source) => source.id), runAt);
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
