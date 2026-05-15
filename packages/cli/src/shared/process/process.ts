import { closeSync, existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

export interface DetachedProcessResult {
  ok: boolean;
  pidFile: string;
  pid?: number;
  logFile: string;
  detail: string;
}

export interface ManagedProcessHandle {
  child: ChildProcess;
  pid: number;
  pidFile: string;
  logFile: string;
}

export async function readPid(pidFile: string): Promise<number | null> {
  try {
    const raw = await readFile(pidFile, "utf8");
    const pid = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

export async function readLogTail(logFile: string, lines = 20): Promise<string[]> {
  try {
    const raw = await readFile(logFile, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .slice(-lines);
  } catch {
    return [];
  }
}

export async function describeDetachedProcess(pidFile: string, logFile: string): Promise<{
  exists: boolean;
  running: boolean;
  pid: number | null;
  tail: string[];
}> {
  const pid = await readPid(pidFile);
  const running = pid ? isProcessRunning(pid) : false;

  return {
    exists: existsSync(pidFile) || existsSync(logFile),
    running,
    pid,
    tail: await readLogTail(logFile)
  };
}

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDetachedProcessStopped(pidFile: string): Promise<void> {
  const pid = await readPid(pidFile);

  if (pid && isProcessRunning(pid)) {
    process.kill(pid, "SIGTERM");
  }

  await rm(pidFile, { force: true });
}

export async function stopManagedProcess(handle: ManagedProcessHandle): Promise<void> {
  if (isProcessRunning(handle.pid)) {
    handle.child.kill("SIGTERM");

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (isProcessRunning(handle.pid)) {
          handle.child.kill("SIGKILL");
        }
      }, 2000);

      handle.child.once("exit", () => {
        clearTimeout(timeout);
        resolve();
      });

      handle.child.once("error", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  await rm(handle.pidFile, { force: true });
}

export async function startDetachedProcess(input: {
  command: string;
  args: string[];
  cwd: string;
  env?: NodeJS.ProcessEnv;
  pidFile: string;
  logFile: string;
}): Promise<DetachedProcessResult> {
  await mkdir(path.dirname(input.pidFile), { recursive: true });
  await mkdir(path.dirname(input.logFile), { recursive: true });

  const stdoutFd = openSync(input.logFile, "a");
  const stderrFd = openSync(input.logFile, "a");

  const child = spawn(input.command, input.args, {
    cwd: input.cwd,
    env: {
      ...process.env,
      ...input.env
    },
    detached: true,
    stdio: ["ignore", stdoutFd, stderrFd]
  });

  child.unref();
  closeSync(stdoutFd);
  closeSync(stderrFd);

  if (!child.pid) {
    return {
      ok: false,
      pidFile: input.pidFile,
      logFile: input.logFile,
      detail: "Process did not return a pid."
    };
  }

  mkdirSync(path.dirname(input.pidFile), { recursive: true });
  writeFileSync(input.pidFile, `${child.pid}\n`, "utf8");

  return {
    ok: true,
    pid: child.pid,
    pidFile: input.pidFile,
    logFile: input.logFile,
    detail: `Started pid ${child.pid}.`
  };
}

export async function startManagedProcess(input: {
  command: string;
  args: string[];
  cwd: string;
  env?: NodeJS.ProcessEnv;
  pidFile: string;
  logFile: string;
}): Promise<DetachedProcessResult & { handle?: ManagedProcessHandle }> {
  await mkdir(path.dirname(input.pidFile), { recursive: true });
  await mkdir(path.dirname(input.logFile), { recursive: true });

  const stdoutFd = openSync(input.logFile, "a");
  const stderrFd = openSync(input.logFile, "a");

  const child = spawn(input.command, input.args, {
    cwd: input.cwd,
    env: {
      ...process.env,
      ...input.env
    },
    detached: false,
    stdio: ["ignore", stdoutFd, stderrFd]
  });

  closeSync(stdoutFd);
  closeSync(stderrFd);

  if (!child.pid) {
    return {
      ok: false,
      pidFile: input.pidFile,
      logFile: input.logFile,
      detail: "Process did not return a pid."
    };
  }

  mkdirSync(path.dirname(input.pidFile), { recursive: true });
  writeFileSync(input.pidFile, `${child.pid}\n`, "utf8");

  return {
    ok: true,
    pid: child.pid,
    pidFile: input.pidFile,
    logFile: input.logFile,
    detail: `Started pid ${child.pid}.`,
    handle: {
      child,
      pid: child.pid,
      pidFile: input.pidFile,
      logFile: input.logFile
    }
  };
}
