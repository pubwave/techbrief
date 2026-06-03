import { describe, expect, it } from "vitest";
import { asString, parseJsonObject } from "../../packages/ai/src/providers/prompt.js";

describe("parseJsonObject", () => {
  it("parses plain JSON", () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("unwraps a ```json fenced block", () => {
    expect(parseJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("unwraps a bare ``` fenced block", () => {
    expect(parseJsonObject('```\n{"b":2}\n```')).toEqual({ b: 2 });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJsonObject("not json")).toThrow();
  });
});

describe("asString", () => {
  it("trims and returns non-empty strings", () => {
    expect(asString("  hi  ")).toBe("hi");
  });

  it("returns undefined for empty/whitespace strings", () => {
    expect(asString("")).toBeUndefined();
    expect(asString("   ")).toBeUndefined();
  });

  it("returns undefined for non-string values", () => {
    expect(asString(42)).toBeUndefined();
    expect(asString(null)).toBeUndefined();
    expect(asString(undefined)).toBeUndefined();
  });
});
