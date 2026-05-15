import { wizardMessage, type WizardLocale } from "../../../shared/i18n/wizard/index.js";
import {
  ensureDetachedProcessStopped,
  startDetachedProcess,
  startManagedProcess,
  stopManagedProcess,
  type ManagedProcessHandle
} from "../../../shared/process/process.js";
import { appendDiagnostic, readLogSummary, waitForUrl } from "../core/helpers.js";
import type { LaunchStep } from "../core/types.js";

export async function startRuntimeService(input: {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  pidFile: string;
  logFile: string;
  url: string;
  session?: boolean;
}): Promise<{
  ok: boolean;
  detail: string;
  cleanup: () => Promise<void>;
}> {
  const result: Awaited<ReturnType<typeof startManagedProcess>> = input.session === true
    ? await startManagedProcess({
      command: input.command,
      args: input.args,
      cwd: input.cwd,
      env: input.env,
      pidFile: input.pidFile,
      logFile: input.logFile
    })
    : await startDetachedProcess({
      command: input.command,
      args: input.args,
      cwd: input.cwd,
      env: input.env,
      pidFile: input.pidFile,
      logFile: input.logFile
    });

  return {
    ok: result.ok,
    detail: result.ok ? `${input.url} -> pid ${result.pid}` : result.detail,
    cleanup: createRuntimeServiceCleanup(result.handle, result.pidFile)
  };
}

export async function probeRuntimeServiceHealth(input: {
  url: string;
  logFile: string;
  successDetail: string;
  failureDetail: string;
}): Promise<{
  ok: boolean;
  detail: string;
}> {
  const healthy = await waitForUrl(input.url);
  const failureSummary = healthy ? null : await readLogSummary(input.logFile);

  return {
    ok: healthy,
    detail: healthy
      ? input.successDetail
      : appendDiagnostic(input.failureDetail, failureSummary)
  };
}

export async function launchServiceWithHealth(input: {
  name: "api" | "web";
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  pidFile: string;
  logFile: string;
  url: string;
  healthUrl: string;
  locale: WizardLocale;
  session?: boolean;
}): Promise<{
  ok: boolean;
  startStep: LaunchStep;
  healthStep: LaunchStep | null;
  cleanup: () => Promise<void>;
}> {
  const startResult = await startRuntimeService({
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    env: input.env,
    pidFile: input.pidFile,
    logFile: input.logFile,
    url: input.url,
    ...(input.session === true ? { session: true } : {})
  });
  const startStep = {
    label: input.name,
    ok: startResult.ok,
    detail: startResult.detail
  };

  if (!startResult.ok) {
    return {
      ok: false,
      startStep,
      healthStep: null,
      cleanup: startResult.cleanup
    };
  }

  const healthResult = await probeRuntimeServiceHealth({
    url: input.healthUrl,
    logFile: input.logFile,
    successDetail: wizardMessage(input.locale, input.name === "api" ? "launchApiReady" : "launchWebReady"),
    failureDetail: wizardMessage(input.locale, input.name === "api" ? "launchApiUnreachable" : "launchWebUnreachable")
  });

  return {
    ok: healthResult.ok,
    startStep,
    cleanup: startResult.cleanup,
    healthStep: {
      label: `${input.name}:health`,
      ok: healthResult.ok,
      detail: healthResult.detail
    }
  };
}

function createRuntimeServiceCleanup(
  handle: ManagedProcessHandle | undefined,
  pidFile: string
): () => Promise<void> {
  if (!handle) {
    return async () => {
      await ensureDetachedProcessStopped(pidFile);
    };
  }

  return async () => {
    await stopManagedProcess(handle);
  };
}
