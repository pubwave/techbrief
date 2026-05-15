import type { AppConfig } from "@techbrief/shared";
import { getNextCronOccurrence, isValidCronExpression } from "./schedule/cron.js";

export function resolveSourceSchedulePolicy(config: AppConfig, sourceId: string): {
  mode: AppConfig["schedule"]["mode"];
  intervalHours?: number;
  cron?: string;
  timezone: string;
} {
  const sourcePolicy = config.schedule.perSource[sourceId];
  return {
    mode: sourcePolicy?.mode ?? config.schedule.mode,
    ...(sourcePolicy?.mode === "interval"
      ? { intervalHours: sourcePolicy.intervalHours ?? config.schedule.intervalHours ?? 6 }
      : config.schedule.mode === "interval"
        ? { intervalHours: config.schedule.intervalHours ?? 6 }
        : {}),
    ...(sourcePolicy?.mode === "cron"
      ? { cron: sourcePolicy.cron ?? config.schedule.cron ?? "0 */6 * * *" }
      : config.schedule.mode === "cron"
        ? { cron: config.schedule.cron ?? "0 */6 * * *" }
        : {}),
    timezone: config.schedule.timezone
  };
}

export function isIntervalScheduleDue(lastRunAt: string | null | undefined, intervalHours: number, now = Date.now()): boolean {
  if (!lastRunAt) {
    return true;
  }

  const lastRunMs = Date.parse(lastRunAt);
  if (!Number.isFinite(lastRunMs)) {
    return true;
  }

  return now - lastRunMs >= intervalHours * 60 * 60 * 1000;
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
