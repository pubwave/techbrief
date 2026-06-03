import { describe, expect, it } from "vitest";
import { extractPublishedAtFromUrl, normalizePublishedAt } from "../../packages/ingest/src/adapters/shared/date-utils.js";

describe("normalizePublishedAt", () => {
  it("parses a display-style date as UTC midnight", () => {
    expect(normalizePublishedAt("Jan 5, 2024")).toBe("2024-01-05T00:00:00.000Z");
  });

  it("normalizes an ISO string to canonical ISO", () => {
    expect(normalizePublishedAt("2024-03-02T10:30:00Z")).toBe("2024-03-02T10:30:00.000Z");
  });

  it("returns undefined for empty or nullish values", () => {
    expect(normalizePublishedAt("")).toBeUndefined();
    expect(normalizePublishedAt(null)).toBeUndefined();
    expect(normalizePublishedAt(undefined)).toBeUndefined();
  });

  it("returns undefined for an unparseable value", () => {
    expect(normalizePublishedAt("not a date")).toBeUndefined();
  });
});

describe("extractPublishedAtFromUrl", () => {
  it("reads a dashed date from the path", () => {
    expect(extractPublishedAtFromUrl("https://example.com/2024-01-05/post")).toBe("2024-01-05T00:00:00.000Z");
  });

  it("reads a slashed date from the path", () => {
    expect(extractPublishedAtFromUrl("https://example.com/2024/1/5/post")).toBe("2024-01-05T00:00:00.000Z");
  });

  it("returns undefined when there is no date in the path", () => {
    expect(extractPublishedAtFromUrl("https://example.com/some/post")).toBeUndefined();
  });

  it("rejects an impossible calendar date", () => {
    expect(extractPublishedAtFromUrl("https://example.com/2024-13-40/post")).toBeUndefined();
  });

  it("returns undefined for an invalid url", () => {
    expect(extractPublishedAtFromUrl("not a url")).toBeUndefined();
  });
});
