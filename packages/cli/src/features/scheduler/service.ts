import { loadConfig, loadSchedulerRunState, setGlobalSchedule } from "@techbrief/runtime";
import { DEFAULT_SCHEDULE_CRON, DEFAULT_SCHEDULE_INTERVAL_MINUTES, MIN_SCHEDULE_INTERVAL_MINUTES } from "@techbrief/shared";

export async function loadSchedulerViewModel(): Promise<{
  mode: string;
  intervalMinutes?: number;
  cron?: string;
  globalLastRunAt?: string;
  globalLastStatus?: "success" | "failed";
  globalLastError?: string;
  sourceStatuses: Array<{
    sourceId: string;
    lastRunAt?: string;
    lastStatus: "success" | "failed";
    lastError?: string;
    lastSavedArticles?: number;
    lastFilteredArticles?: number;
    lastSkippedSources?: number;
  }>;
  recentErrors: Array<{ runAt: string; message: string; sourceId?: string }>;
}> {
  const [config, state] = await Promise.all([
    loadConfig(),
    loadSchedulerRunState()
  ]);

  const sourceStatuses = Object.entries(state.perSourceState)
    .map(([sourceId, sourceState]) => ({
      sourceId,
      ...sourceState
    }))
    .sort((left, right) => (right.lastRunAt ?? "").localeCompare(left.lastRunAt ?? ""));

  return {
    mode: config.schedule.mode,
    ...(typeof config.schedule.intervalMinutes === "number" ? { intervalMinutes: config.schedule.intervalMinutes } : {}),
    ...(typeof config.schedule.cron === "string" ? { cron: config.schedule.cron } : {}),
    ...(state.globalLastRunAt ? { globalLastRunAt: state.globalLastRunAt } : {}),
    ...(state.globalLastStatus ? { globalLastStatus: state.globalLastStatus } : {}),
    ...(state.globalLastError ? { globalLastError: state.globalLastError } : {}),
    sourceStatuses,
    recentErrors: state.recentErrors
  };
}

export async function updateSchedulerPolicy(options: Record<string, string | boolean>): Promise<{
  updatedGlobal?: {
    mode: string;
    intervalMinutes?: number;
    cron?: string;
  };
}> {
  const mode = options.mode === "cron" ? "cron" : "interval";
  const schedule = await setGlobalSchedule(buildGlobalSchedulePolicy(mode, options));
  return {
    updatedGlobal: {
      mode: schedule.mode,
      ...(typeof schedule.intervalMinutes === "number" ? { intervalMinutes: schedule.intervalMinutes } : {}),
      ...(typeof schedule.cron === "string" ? { cron: schedule.cron } : {})
    }
  };
}

function buildGlobalSchedulePolicy(
  mode: "interval" | "cron",
  options: Record<string, string | boolean>
): {
  mode: "interval" | "cron";
  intervalMinutes?: number;
  cron?: string;
} {
  if (mode === "interval") {
    const rawMinutes = options["interval-minutes"] ?? options.minutes ?? DEFAULT_SCHEDULE_INTERVAL_MINUTES;
    const parsedMinutes = Number.parseInt(String(rawMinutes), 10);
    return {
      mode: "interval",
      intervalMinutes: Number.isFinite(parsedMinutes)
        ? Math.max(MIN_SCHEDULE_INTERVAL_MINUTES, parsedMinutes)
        : DEFAULT_SCHEDULE_INTERVAL_MINUTES
    };
  }

  return {
    mode: "cron",
    cron: String(options.cron ?? DEFAULT_SCHEDULE_CRON)
  };
}
