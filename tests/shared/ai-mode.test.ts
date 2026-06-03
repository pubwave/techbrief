import { describe, expect, it } from "vitest";
import { requiresAiForLanguage, skipsAiForLanguage } from "../../packages/shared/src/languages/ai-mode.js";

describe("requiresAiForLanguage", () => {
  it("is false for English (the source language, no translation needed)", () => {
    expect(requiresAiForLanguage("en")).toBe(false);
  });

  it("is true for any non-English language", () => {
    expect(requiresAiForLanguage("zh-CN")).toBe(true);
    expect(requiresAiForLanguage("ja")).toBe(true);
    expect(requiresAiForLanguage("fr")).toBe(true);
  });
});

describe("skipsAiForLanguage", () => {
  it("is the inverse of requiresAiForLanguage", () => {
    expect(skipsAiForLanguage("en")).toBe(true);
    expect(skipsAiForLanguage("ko")).toBe(false);
  });
});
