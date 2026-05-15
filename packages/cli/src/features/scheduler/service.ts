import { listAllSources, loadConfig, loadSchedulerRunState, setGlobalSchedule, setSourceSchedule } from "@techbrief/runtime";

export async function loadSchedulerViewModel(): Promise<{
  mode: string;
  intervalHours?: number;
  cron?: string;
  timezone: string;
  globalLastRunAt?: string;
  globalLastStatus?: "success" | "failed";
  globalLastError?: string;
  sourceOverrides: Array<{ sourceId: string; mode: string; intervalHours?: number; cron?: string }>;
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
  const [config, state, sources] = await Promise.all([
    loadConfig(),
    loadSchedulerRunState(),
    listAllSources()
  ]);

  const sourceNameSet = new Set(sources.map((source) => source.id));
  const sourceOverrides = Object.entries(config.schedule.perSource)
    .filter(([sourceId]) => sourceNameSet.has(sourceId))
    .map(([sourceId, policy]) => ({
      sourceId,
      mode: policy.mode,
      ...(typeof policy.intervalHours === "number" ? { intervalHours: policy.intervalHours } : {}),
      ...(typeof policy.cron === "string" ? { cron: policy.cron } : {})
    }))
    .sort((left, right) => left.sourceId.localeCompare(right.sourceId));

  const sourceStatuses = Object.entries(state.perSourceState)
    .map(([sourceId, sourceState]) => ({
      sourceId,
      ...sourceState
    }))
    .sort((left, right) => (right.lastRunAt ?? "").localeCompare(left.lastRunAt ?? ""));

  return {
    mode: config.schedule.mode,
    ...(typeof config.schedule.intervalHours === "number" ? { intervalHours: config.schedule.intervalHours } : {}),
    ...(typeof config.schedule.cron === "string" ? { cron: config.schedule.cron } : {}),
    timezone: config.schedule.timezone,
    ...(state.globalLastRunAt ? { globalLastRunAt: state.globalLastRunAt } : {}),
    ...(state.globalLastStatus ? { globalLastStatus: state.globalLastStatus } : {}),
    ...(state.globalLastError ? { globalLastError: state.globalLastError } : {}),
    sourceOverrides,
    sourceStatuses,
    recentErrors: state.recentErrors
  };
}

export async function updateSchedulerPolicy(options: Record<string, string | boolean>): Promise<{
  updatedGlobal?: {
    mode: string;
    intervalHours?: number;
    cron?: string;
    timezone: string;
  };
  updatedSource?: {
    sourceId: string;
    mode: "interval" | "cron";
    intervalHours?: number;
    cron?: string;
  };
}> {
  const mode = options.mode === "cron" ? "cron" : "interval";
  const sourceId = typeof options.source === "string" ? options.source : undefined;
  const sourcePolicy = mode === "cron"
    ? { mode: "cron" as const, cron: String(options.cron ?? "0 */6 * * *") }
    : { mode: "interval" as const, intervalHours: Number.parseInt(String(options.hours ?? "6"), 10) };

  if (sourceId) {
    await setSourceSchedule(sourceId, sourcePolicy);
    return {
      updatedSource: {
        sourceId,
        ...sourcePolicy
      }
    };
  }

  const schedule = await setGlobalSchedule(buildGlobalSchedulePolicy(mode, options));
  return {
    updatedGlobal: {
      mode: schedule.mode,
      ...(typeof schedule.intervalHours === "number" ? { intervalHours: schedule.intervalHours } : {}),
      ...(typeof schedule.cron === "string" ? { cron: schedule.cron } : {}),
      timezone: schedule.timezone
    }
  };
}

function buildGlobalSchedulePolicy(
  mode: "interval" | "cron",
  options: Record<string, string | boolean>
): {
  mode: "interval" | "cron";
  intervalHours?: number;
  cron?: string;
  timezone?: string;
} {
  if (mode === "interval") {
    return {
      mode: "interval",
      intervalHours: Number.parseInt(String(options.hours ?? "6"), 10),
      ...(typeof options.timezone === "string" ? { timezone: options.timezone } : {})
    };
  }

  return {
    mode: "cron",
    cron: String(options.cron ?? "0 */6 * * *"),
    ...(typeof options.timezone === "string" ? { timezone: options.timezone } : {})
  };
}
