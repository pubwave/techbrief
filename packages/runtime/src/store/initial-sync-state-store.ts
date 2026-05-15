import { requiresAiForLanguage, type AppConfig } from "@techbrief/shared";
import { getInitialSyncStateFile } from "../fs/paths.js";
import { readJsonFile, writeJsonFile } from "../fs/json-file.js";

export type InitialSyncStatus = "idle" | "in_progress" | "completed" | "failed";

export interface InitialSyncState {
  status: InitialSyncStatus;
  targetLanguage: string | null;
  requiresAi: boolean;
  schedulerEnabled: boolean;
  startedAt: string | null;
  completedAt: string | null;
  lastUpdatedAt: string | null;
  failureMessage: string | null;
}

const DEFAULT_INITIAL_SYNC_STATE: InitialSyncState = {
  status: "idle",
  targetLanguage: null,
  requiresAi: false,
  schedulerEnabled: false,
  startedAt: null,
  completedAt: null,
  lastUpdatedAt: null,
  failureMessage: null
};

export async function loadInitialSyncState(): Promise<InitialSyncState> {
  const state = await readJsonFile<InitialSyncState | undefined>(getInitialSyncStateFile(), undefined);
  if (!state) {
    return { ...DEFAULT_INITIAL_SYNC_STATE };
  }

  return {
    status: state.status ?? DEFAULT_INITIAL_SYNC_STATE.status,
    targetLanguage: state.targetLanguage ?? null,
    requiresAi: state.requiresAi ?? false,
    schedulerEnabled: state.schedulerEnabled ?? false,
    startedAt: state.startedAt ?? null,
    completedAt: state.completedAt ?? null,
    lastUpdatedAt: state.lastUpdatedAt ?? null,
    failureMessage: state.failureMessage ?? null
  };
}

export async function saveInitialSyncState(state: InitialSyncState): Promise<void> {
  await writeJsonFile(getInitialSyncStateFile(), state);
}

export async function markInitialSyncStarted(targetLanguage: string): Promise<InitialSyncState> {
  const now = new Date().toISOString();
  const next: InitialSyncState = {
    status: "in_progress",
    targetLanguage,
    requiresAi: requiresAiForLanguage(targetLanguage),
    schedulerEnabled: false,
    startedAt: now,
    completedAt: null,
    lastUpdatedAt: now,
    failureMessage: null
  };
  await saveInitialSyncState(next);
  return next;
}

export async function markInitialSyncCompleted(targetLanguage: string): Promise<InitialSyncState> {
  const current = await loadInitialSyncState();
  const now = new Date().toISOString();
  const next: InitialSyncState = {
    status: "completed",
    targetLanguage,
    requiresAi: requiresAiForLanguage(targetLanguage),
    schedulerEnabled: true,
    startedAt: current.startedAt ?? now,
    completedAt: now,
    lastUpdatedAt: now,
    failureMessage: null
  };
  await saveInitialSyncState(next);
  return next;
}

export async function markInitialSyncFailed(
  targetLanguage: string,
  failureMessage: string
): Promise<InitialSyncState> {
  const current = await loadInitialSyncState();
  const now = new Date().toISOString();
  const next: InitialSyncState = {
    status: "failed",
    targetLanguage,
    requiresAi: requiresAiForLanguage(targetLanguage),
    schedulerEnabled: false,
    startedAt: current.startedAt ?? now,
    completedAt: null,
    lastUpdatedAt: now,
    failureMessage
  };
  await saveInitialSyncState(next);
  return next;
}

export async function isInitialSyncCompleteForConfig(config: AppConfig): Promise<boolean> {
  const state = await loadInitialSyncState();
  return isInitialSyncStateCurrent(state, config);
}

export function isInitialSyncStateCurrent(state: InitialSyncState, config: AppConfig): boolean {
  const targetLanguage = config.app.defaultLanguage;
  return state.status === "completed"
    && state.schedulerEnabled
    && state.targetLanguage === targetLanguage
    && state.requiresAi === requiresAiForLanguage(targetLanguage);
}
