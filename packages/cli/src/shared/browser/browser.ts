import os from "node:os";
import { spawnSync } from "node:child_process";

export interface BrowserOpenResult {
  ok: boolean;
  detail: string;
}

export interface ExternalOpenResult {
  ok: boolean;
  detail: string;
}

export function openBrowser(url: string): BrowserOpenResult {
  const platform = os.platform();

  if (platform === "darwin") {
    const result = spawnSync("open", [url], { encoding: "utf8" });
    return {
      ok: result.status === 0 && !result.error,
      detail: result.error?.message ?? "Browser open attempted with macOS open."
    };
  }

  if (platform === "linux") {
    const result = spawnSync("xdg-open", [url], { encoding: "utf8" });
    return {
      ok: result.status === 0 && !result.error,
      detail: result.error?.message ?? "Browser open attempted with xdg-open."
    };
  }

  return {
    ok: false,
    detail: "Automatic browser opening is not configured for this platform."
  };
}

export function openPath(targetPath: string, appName?: string): ExternalOpenResult {
  const platform = os.platform();

  if (platform === "darwin") {
    const args = appName ? ["-a", appName, targetPath] : [targetPath];
    const result = spawnSync("open", args, { encoding: "utf8" });
    return {
      ok: result.status === 0 && !result.error,
      detail: result.error?.message ?? "Path open attempted with macOS open."
    };
  }

  if (platform === "linux") {
    const result = spawnSync("xdg-open", [targetPath], { encoding: "utf8" });
    return {
      ok: result.status === 0 && !result.error,
      detail: result.error?.message ?? "Path open attempted with xdg-open."
    };
  }

  return {
    ok: false,
    detail: "Automatic file opening is not configured for this platform."
  };
}
