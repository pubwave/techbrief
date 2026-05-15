import { getSchedulerStateFile } from "../fs/paths.js";
import { readJsonFile, writeJsonFile } from "../fs/json-file.js";

export interface SchedulerRunState {
  globalLastRunAt?: string;
  globalLastStatus?: "success" | "failed";
  globalLastError?: string;
  perSourceLastRunAt: Record<string, string>;
  perSourceState: Record<string, {
    lastRunAt?: string;
    lastStatus: "success" | "failed";
    lastError?: string;
    lastSavedArticles?: number;
    lastFilteredArticles?: number;
    lastSkippedSources?: number;
  }>;
  recentErrors: Array<{
    runAt: string;
    message: string;
    sourceId?: string;
  }>;
}

const DEFAULT_SCHEDULER_RUN_STATE: SchedulerRunState = {
  perSourceLastRunAt: {},
  perSourceState: {},
  recentErrors: []
};

export async function loadSchedulerRunState(): Promise<SchedulerRunState> {
  const state = await readJsonFile<SchedulerRunState | undefined>(getSchedulerStateFile(), undefined);
  if (!state) {
    return { ...DEFAULT_SCHEDULER_RUN_STATE };
  }

  return {
    ...(state.globalLastRunAt ? { globalLastRunAt: state.globalLastRunAt } : {}),
    ...(state.globalLastStatus ? { globalLastStatus: state.globalLastStatus } : {}),
    ...(state.globalLastError ? { globalLastError: state.globalLastError } : {}),
    perSourceLastRunAt: {
      ...state.perSourceLastRunAt
    },
    perSourceState: {
      ...(state.perSourceState ?? {})
    },
    recentErrors: [...(state.recentErrors ?? [])]
  };
}

export async function saveSchedulerRunState(state: SchedulerRunState): Promise<void> {
  await writeJsonFile(getSchedulerStateFile(), state);
}

export async function markSourceSchedulerRun(
  sourceId: string,
  runAt: string,
  stats?: {
    savedArticles?: number;
    filteredArticles?: number;
    skippedSources?: number;
  }
): Promise<SchedulerRunState> {
  const current = await loadSchedulerRunState();
  const next: SchedulerRunState = {
    ...current,
    globalLastRunAt: runAt,
    globalLastStatus: "success",
    perSourceLastRunAt: {
      ...current.perSourceLastRunAt,
      [sourceId]: runAt
    },
    perSourceState: {
      ...current.perSourceState,
      [sourceId]: {
        lastRunAt: runAt,
        lastStatus: "success",
        ...(typeof stats?.savedArticles === "number" ? { lastSavedArticles: stats.savedArticles } : {}),
        ...(typeof stats?.filteredArticles === "number" ? { lastFilteredArticles: stats.filteredArticles } : {}),
        ...(typeof stats?.skippedSources === "number" ? { lastSkippedSources: stats.skippedSources } : {})
      }
    },
    recentErrors: current.recentErrors
  };
  await saveSchedulerRunState(next);
  return next;
}

export async function recordSchedulerSourceFailure(sourceId: string, runAt: string, message: string): Promise<SchedulerRunState> {
  const current = await loadSchedulerRunState();
  const next: SchedulerRunState = {
    ...current,
    globalLastRunAt: runAt,
    globalLastStatus: "failed",
    globalLastError: message,
    perSourceState: {
      ...current.perSourceState,
      [sourceId]: {
        lastRunAt: runAt,
        lastStatus: "failed",
        lastError: message
      }
    },
    recentErrors: [
      {
        runAt,
        sourceId,
        message
      },
      ...current.recentErrors
    ].slice(0, 20)
  };
  await saveSchedulerRunState(next);
  return next;
}

export async function recordSchedulerTickFailure(runAt: string, message: string): Promise<SchedulerRunState> {
  const current = await loadSchedulerRunState();
  const next: SchedulerRunState = {
    ...current,
    globalLastRunAt: runAt,
    globalLastStatus: "failed",
    globalLastError: message,
    recentErrors: [
      {
        runAt,
        message
      },
      ...current.recentErrors
    ].slice(0, 20)
  };
  await saveSchedulerRunState(next);
  return next;
}
