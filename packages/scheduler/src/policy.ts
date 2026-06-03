import { DEFAULT_SCHEDULE_CRON, DEFAULT_SCHEDULE_INTERVAL_MINUTES, MIN_SCHEDULE_INTERVAL_MINUTES, type AppConfig } from "@techbrief/shared";
import { getNextCronOccurrence, isValidCronExpression } from "./schedule/cron.js";

export function resolveSchedulePolicy(config: AppConfig): {
  mode: AppConfig["schedule"]["mode"];
  intervalMinutes?: number;
  cron?: string;
} {
  return {
    mode: config.schedule.mode,
    ...(config.schedule.mode === "interval"
      ? { intervalMinutes: clampIntervalMinutes(config.schedule.intervalMinutes ?? DEFAULT_SCHEDULE_INTERVAL_MINUTES) }
      : {}),
    ...(config.schedule.mode === "cron" ? { cron: config.schedule.cron ?? DEFAULT_SCHEDULE_CRON } : {})
  };
}

// Guard against 0/negative/NaN intervals, which would make a source perpetually
// "due" and re-sync on every poll tick.
export function clampIntervalMinutes(value: number): number {
  return Number.isFinite(value) && value >= MIN_SCHEDULE_INTERVAL_MINUTES
    ? Math.floor(value)
    : MIN_SCHEDULE_INTERVAL_MINUTES;
}

export function isIntervalScheduleDue(lastRunAt: string | null | undefined, intervalMinutes: number, now = Date.now()): boolean {
  if (!lastRunAt) {
    return true;
  }

  const lastRunMs = Date.parse(lastRunAt);
  if (!Number.isFinite(lastRunMs)) {
    return true;
  }

  return now - lastRunMs >= intervalMinutes * 60 * 1000;
}

export function isCronScheduleDue(lastRunAt: string | null | undefined, cron: string, now = new Date()): boolean {
  return getNextCronRunTime(lastRunAt, cron) <= now.getTime();
}

export function getNextCronRunTime(lastRunAt: string | null | undefined, cron: string): number {
  if (!isValidCronExpression(cron)) {
    throw new Error(`Invalid cron expression: ${cron}`);
  }

  const anchor = lastRunAt ? new Date(lastRunAt) : new Date(Date.now() - 60_000);
  if (!Number.isFinite(anchor.getTime())) {
    return Date.now();
  }

  return getNextCronOccurrence(cron, anchor).getTime();
}
