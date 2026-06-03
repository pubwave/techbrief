export const CONTENT_TYPES = ["tech-news", "indie-dev"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type SourcePreset = "core-default" | "custom";
export type SourceState = "enabled" | "disabled";

export type ScheduleMode = "interval" | "cron";

export interface SchedulePolicy {
  mode: ScheduleMode;
  intervalMinutes?: number;
  cron?: string;
}
