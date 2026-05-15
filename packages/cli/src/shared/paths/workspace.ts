import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface CommandResult {
  ok: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export interface AsyncCommandHandlers {
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export function isWorkspaceRootPath(candidate: string): boolean {
  return existsSync(path.join(candidate, "apps/mobile")) && existsSync(path.join(candidate, "package.json"));
}

export function resolveDevelopmentWorkspaceRoot(): string | null {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (isWorkspaceRootPath(currentDir)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function resolveWorkspaceRoot(): string {
  const developmentWorkspaceRoot = resolveDevelopmentWorkspaceRoot();
  if (developmentWorkspaceRoot) {
    return developmentWorkspaceRoot;
  }

  return process.cwd();
}

export const workspaceRoot = resolveWorkspaceRoot();
export const mobileAppRoot = path.join(workspaceRoot, "apps/mobile");

export function runCommand(command: string, args: string[], cwd = workspaceRoot): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8"
  });

  const stdout = result.stdout?.trim() ?? "";
  const stderr = result.stderr?.trim() ?? "";

  return {
    ok: result.status === 0 && !result.error,
    exitCode: result.status,
    stdout,
    stderr: result.error?.message ?? stderr
  };
}

export async function runCommandAsync(
  command: string,
  args: string[],
  cwd = workspaceRoot,
  handlers?: AsyncCommandHandlers
): Promise<CommandResult> {
  return await new Promise<CommandResult>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      const text = String(chunk);
      stdout += text;
      handlers?.onStdout?.(text);
    });

    child.stderr?.on("data", (chunk) => {
      const text = String(chunk);
      stderr += text;
      handlers?.onStderr?.(text);
    });

    child.on("error", (error) => {
      resolve({
        ok: false,
        exitCode: null,
        stdout: stdout.trim(),
        stderr: error.message || stderr.trim()
      });
    });

    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

export function probeCommand(command: string, args: string[]): CommandResult {
  return runCommand(command, args);
}

export function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

export function runInteractiveCommand(command: string, args: string[], cwd = workspaceRoot): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
    stdio: "inherit"
  });

  return {
    ok: result.status === 0 && !result.error,
    exitCode: result.status,
    stdout: "",
    stderr: result.error?.message ?? ""
  };
}
