export const CONTENT_TYPES = ["tech-news", "indie-dev"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type SourcePreset = "core-default" | "custom";
export type SourceState = "builtin" | "custom-pending" | "active" | "disabled" | "rejected" | "error";

export type ScheduleMode = "interval" | "cron";

export interface SchedulePolicy {
  mode: ScheduleMode;
  intervalHours?: number;
  cron?: string;
}

export interface SourceSchedulePolicy extends SchedulePolicy {
  timezone?: string;
}
