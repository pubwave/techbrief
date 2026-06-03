import { describe, expect, it } from "vitest";
import { getNextCronOccurrence, isValidCronExpression } from "../../packages/scheduler/src/schedule/cron.js";

describe("isValidCronExpression", () => {
  it("accepts a standard 5-field expression", () => {
    expect(isValidCronExpression("0 0 * * *")).toBe(true);
    expect(isValidCronExpression("*/15 * * * *")).toBe(true);
  });

  it("rejects malformed expressions", () => {
    expect(isValidCronExpression("not a cron")).toBe(false);
    expect(isValidCronExpression("0 0 *")).toBe(false);
  });
});

describe("getNextCronOccurrence", () => {
  it("returns the next UTC midnight for '0 0 * * *'", () => {
    const after = new Date("2024-03-01T10:00:00.000Z");
    expect(getNextCronOccurrence("0 0 * * *", after).toISOString()).toBe("2024-03-02T00:00:00.000Z");
  });

  it("advances to the next matching minute for '*/15 * * * *'", () => {
    const after = new Date("2024-03-01T10:07:00.000Z");
    expect(getNextCronOccurrence("*/15 * * * *", after).toISOString()).toBe("2024-03-01T10:15:00.000Z");
  });
});
