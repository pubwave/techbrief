import { probeCommand } from "./workspace.js";

let pathInitialized = false;

export function ensureSessionPathInitialized(): void {
  if (pathInitialized) {
    return;
  }

  refreshSessionPath();
  pathInitialized = true;
}

export function refreshSessionPath(): void {
  if (process.platform === "win32") {
    refreshWindowsPath();
    return;
  }

  const shell = process.env.SHELL?.trim() || "sh";
  const result = probeCommand(shell, ["-lc", "printf %s \"$PATH\""]);
  const nextPath = result.ok ? result.stdout.trim() : "";

  if (nextPath) {
    process.env.PATH = nextPath;
  }
}

function refreshWindowsPath(): void {
  const result = probeCommand("powershell", [
    "-NoProfile",
    "-Command",
    "[Environment]::GetEnvironmentVariable('Path','Machine');" +
      "Write-Output '---PATH-SEPARATOR---';" +
      "[Environment]::GetEnvironmentVariable('Path','User')"
  ]);

  if (!result.ok || !result.stdout) {
    return;
  }

  const [machinePath, userPath] = result.stdout.split("---PATH-SEPARATOR---").map((segment) => segment.trim());
  const nextPath = [machinePath, userPath].filter(Boolean).join(";");

  if (nextPath) {
    process.env.PATH = nextPath;
    process.env.Path = nextPath;
  }
}
