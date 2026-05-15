import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { logsRoot } from "../../../shared/paths/runtime-paths.js";

interface MobileInstallErrorLogInput {
  command?: string;
  deviceLabel?: string;
  workspaceDir?: string;
  errorText: string;
}

export const MOBILE_INSTALL_ERROR_LOG = path.join(logsRoot(), "app_install_error.log");

export async function appendMobileInstallErrorLog(input: MobileInstallErrorLogInput): Promise<void> {
  const lines = [
    `[${new Date().toISOString()}]`,
    ...(input.deviceLabel ? [`device=${input.deviceLabel}`] : []),
    ...(input.workspaceDir ? [`workspace=${input.workspaceDir}`] : []),
    ...(input.command ? [`command=${input.command}`] : []),
    "error:",
    input.errorText.trim() || "Unknown mobile install error",
    ""
  ];

  await mkdir(path.dirname(MOBILE_INSTALL_ERROR_LOG), { recursive: true });
  await appendFile(MOBILE_INSTALL_ERROR_LOG, `${lines.join("\n")}\n`, "utf8");
}
