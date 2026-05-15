import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const APP_HOME_DIR_NAME = ".techbrief";
const WORKSPACE_MARKERS = ["package.json", "apps/mobile", "apps/web", "apps/server"];

export function resolveAppHome(): string {
  const override = process.env.TECHBRIEF_HOME?.trim();
  if (override) {
    return path.resolve(override);
  }

  const workspaceAppHome = resolveWorkspaceAppHome(process.cwd());
  if (workspaceAppHome) {
    return workspaceAppHome;
  }

  return path.join(os.homedir(), APP_HOME_DIR_NAME);
}

function resolveWorkspaceAppHome(startDir: string): string | null {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (isWorkspaceRoot(currentDir)) {
      return path.join(currentDir, APP_HOME_DIR_NAME);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function isWorkspaceRoot(dirPath: string): boolean {
  return WORKSPACE_MARKERS.every((marker) => fs.existsSync(path.join(dirPath, marker)));
}
