import { resolveDefaultLocalBindHost, resolveDefaultLocalOrigin } from "@techbrief/ai";
import { describeDetachedProcess, ensureDetachedProcessStopped, startDetachedProcess } from "../../../shared/process/process.js";
import { processFiles } from "../../../shared/paths/runtime-paths.js";
import { detectWizardLocale } from "../../../shared/i18n/wizard/index.js";
import { registerSessionCleanupTask } from "../../../shared/process/session-cleanup.js";
import { localSupportInstalledNotReady, localSupportReadyAt } from "../local-model-messages.js";

const LOCAL_RUNTIME_PORT = 11434;
const LOCAL_RUNTIME_START_TIMEOUT_MS = 15_000;
const LOCAL_RUNTIME_POLL_INTERVAL_MS = 500;

export interface LocalRuntimeEnsureResult {
  ok: boolean;
  detail: string;
  attemptedStart: boolean;
}

export async function ensureLocalRuntimeStarted(input?: { session?: boolean }): Promise<LocalRuntimeEnsureResult> {
  const locale = detectWizardLocale();
  if (await isLocalRuntimeReachable()) {
    return {
      ok: true,
      detail: localSupportReadyAt(locale, resolveDefaultLocalOrigin()),
      attemptedStart: false
    };
  }

  const files = processFiles("local-runtime");
  const description = await describeDetachedProcess(files.pidFile, files.logFile);
  if (description.exists && !description.running) {
    await ensureDetachedProcessStopped(files.pidFile);
  }

  if (!description.running) {
    const started = await startDetachedProcess({
      command: "ollama",
      args: ["serve"],
      cwd: process.cwd(),
      env: {
        OLLAMA_HOST: `${resolveDefaultLocalBindHost()}:${LOCAL_RUNTIME_PORT}`
      },
      pidFile: files.pidFile,
      logFile: files.logFile
    });

    if (!started.ok) {
      return {
        ok: false,
        detail: localSupportInstalledNotReady(locale),
        attemptedStart: true
      };
    }

    if (input?.session === true) {
      registerSessionCleanupTask(async () => {
        await ensureDetachedProcessStopped(files.pidFile);
      });
    }
  }

  const ready = await waitForLocalRuntime();
  return {
    ok: ready,
    detail: ready
      ? localSupportReadyAt(locale, resolveDefaultLocalOrigin())
      : localSupportInstalledNotReady(locale),
    attemptedStart: true
  };
}

async function waitForLocalRuntime(): Promise<boolean> {
  const deadline = Date.now() + LOCAL_RUNTIME_START_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (await isLocalRuntimeReachable()) {
      return true;
    }

    await sleep(LOCAL_RUNTIME_POLL_INTERVAL_MS);
  }

  return false;
}

async function isLocalRuntimeReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveDefaultLocalOrigin()}/api/version`, {
      signal: AbortSignal.timeout(1_500)
    });
    return response.ok;
  } catch {
    // Ignore transient connection failures while probing local runtime.
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
