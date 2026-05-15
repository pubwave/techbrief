import os from "node:os";
import path from "node:path";
import { resolveDevelopmentWorkspaceRoot } from "./workspace.js";

const APP_HOME_DIR_NAME = ".techbrief";

export function resolveCliAppHome(): string {
  const override = process.env.TECHBRIEF_HOME?.trim();
  if (override) {
    return path.resolve(override);
  }

  const workspaceRoot = resolveDevelopmentWorkspaceRoot();
  if (workspaceRoot) {
    return path.join(workspaceRoot, APP_HOME_DIR_NAME);
  }

  return path.join(os.homedir(), APP_HOME_DIR_NAME);
}
