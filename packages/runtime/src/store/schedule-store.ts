import type { AppConfig, SchedulePolicy } from "@techbrief/shared";
import { updateConfig } from "./config-store.js";

export async function setGlobalSchedule(policy: {
  mode: AppConfig["schedule"]["mode"];
  intervalHours?: number;
  cron?: string;
  timezone?: string;
}): Promise<AppConfig["schedule"]> {
  const updatedConfig = await updateConfig((current) => ({
    ...current,
    schedule: {
      ...current.schedule,
      mode: policy.mode,
      ...(policy.mode === "interval" ? { intervalHours: policy.intervalHours ?? current.schedule.intervalHours } : {}),
      ...(policy.mode === "cron" ? { cron: policy.cron ?? current.schedule.cron ?? "0 */6 * * *" } : {}),
      timezone: policy.timezone ?? current.schedule.timezone
    }
  }));

  return updatedConfig.schedule;
}

export async function setSourceSchedule(sourceId: string, policy: SchedulePolicy): Promise<AppConfig["schedule"]> {
  const updatedConfig = await updateConfig((current) => ({
    ...current,
    schedule: {
      ...current.schedule,
      perSource: {
        ...current.schedule.perSource,
        [sourceId]: policy
      }
    }
  }));

  return updatedConfig.schedule;
}
