import { describe, expect, it } from "vitest";
import type { AppConfig } from "@techbrief/shared";
import { MIN_SCHEDULE_INTERVAL_MINUTES } from "@techbrief/shared";
import {
  clampIntervalMinutes,
  getNextCronRunTime,
  isCronScheduleDue,
  isIntervalScheduleDue,
  resolveSchedulePolicy
} from "../../packages/scheduler/src/policy.js";

describe("clampIntervalMinutes", () => {
  it("floors valid values", () => {
    expect(clampIntervalMinutes(MIN_SCHEDULE_INTERVAL_MINUTES + 10.9)).toBe(MIN_SCHEDULE_INTERVAL_MINUTES + 10);
  });

  it("raises sub-minimum / invalid values to the minimum", () => {
    expect(clampIntervalMinutes(0)).toBe(MIN_SCHEDULE_INTERVAL_MINUTES);
    expect(clampIntervalMinutes(-5)).toBe(MIN_SCHEDULE_INTERVAL_MINUTES);
    expect(clampIntervalMinutes(Number.NaN)).toBe(MIN_SCHEDULE_INTERVAL_MINUTES);
  });
});

describe("isIntervalScheduleDue", () => {
  const now = Date.parse("2024-03-01T12:00:00Z");

  it("is due when there is no last run", () => {
    expect(isIntervalScheduleDue(null, 60, now)).toBe(true);
    expect(isIntervalScheduleDue("garbage", 60, now)).toBe(true);
  });

  it("is due only after the interval has elapsed", () => {
    expect(isIntervalScheduleDue("2024-03-01T11:00:00Z", 60, now)).toBe(true);
    expect(isIntervalScheduleDue("2024-03-01T11:30:00Z", 60, now)).toBe(false);
  });
});

describe("isCronScheduleDue", () => {
  it("is due once the next occurrence after the last run has passed", () => {
    expect(isCronScheduleDue("2024-03-01T00:00:00Z", "0 0 * * *", new Date("2024-03-02T00:00:00Z"))).toBe(true);
    expect(isCronScheduleDue("2024-03-01T00:00:00Z", "0 0 * * *", new Date("2024-03-01T12:00:00Z"))).toBe(false);
  });
});

describe("getNextCronRunTime", () => {
  it("throws on an invalid cron", () => {
    expect(() => getNextCronRunTime(null, "bad cron")).toThrow();
  });
});

describe("resolveSchedulePolicy", () => {
  it("returns a clamped interval in interval mode", () => {
    const config = { schedule: { mode: "interval", intervalMinutes: 0 } } as AppConfig;
    expect(resolveSchedulePolicy(config)).toEqual({ mode: "interval", intervalMinutes: MIN_SCHEDULE_INTERVAL_MINUTES });
  });

  it("returns the cron in cron mode", () => {
    const config = { schedule: { mode: "cron", cron: "0 9 * * *" } } as AppConfig;
    expect(resolveSchedulePolicy(config)).toEqual({ mode: "cron", cron: "0 9 * * *" });
  });
});
