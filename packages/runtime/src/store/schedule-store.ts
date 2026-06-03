import { DEFAULT_SCHEDULE_CRON, type AppConfig } from "@techbrief/shared";
import { updateConfig } from "./config-store.js";

export async function setGlobalSchedule(policy: {
  mode: AppConfig["schedule"]["mode"];
  intervalMinutes?: number;
  cron?: string;
}): Promise<AppConfig["schedule"]> {
  const updatedConfig = await updateConfig((current) => ({
    ...current,
    schedule: {
      ...current.schedule,
      mode: policy.mode,
      ...(policy.mode === "interval" ? { intervalMinutes: policy.intervalMinutes ?? current.schedule.intervalMinutes } : {}),
      ...(policy.mode === "cron" ? { cron: policy.cron ?? current.schedule.cron ?? DEFAULT_SCHEDULE_CRON } : {})
    }
  }));

  return updatedConfig.schedule;
}
