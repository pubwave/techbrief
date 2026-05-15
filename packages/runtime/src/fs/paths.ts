import path from "node:path";
import { resolveAppHome } from "./app-home.js";

export function getAppStateDir(): string {
  return resolveAppHome();
}

export function getConfigFile(): string {
  return path.join(getAppStateDir(), "config.json");
}

export function getCustomSourcesFile(): string {
  return path.join(getAppStateDir(), "custom-sources.json");
}

export function getSchedulerStateFile(): string {
  return path.join(getAppStateDir(), "scheduler-state.json");
}

export function getInitialSyncStateFile(): string {
  return path.join(getAppStateDir(), "initial-sync-state.json");
}
