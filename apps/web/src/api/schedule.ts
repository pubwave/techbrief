import { fetchJson } from "./http";

export interface ScheduleInfo {
  mode: string;
  intervalMinutes?: number;
  cron?: string;
  lastSyncAt: string | null;
}

export async function fetchSchedule(): Promise<ScheduleInfo> {
  return fetchJson<ScheduleInfo>("/v1/schedule");
}
