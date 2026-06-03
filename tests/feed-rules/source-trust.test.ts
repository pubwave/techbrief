import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "@techbrief/shared";
import { isWeakSource } from "../../packages/feed-rules/src/source-trust.js";

const sourceWithId = (id: string) => ({ id }) as SourceDefinition;

describe("isWeakSource", () => {
  it("treats an undefined source as weak", () => {
    expect(isWeakSource(undefined)).toBe(true);
  });

  it("flags known weak id prefixes", () => {
    expect(isWeakSource(sourceWithId("hashnode-foo"))).toBe(true);
    expect(isWeakSource(sourceWithId("devto-bar"))).toBe(true);
    expect(isWeakSource(sourceWithId("hackernews-show"))).toBe(true);
  });

  it("flags the explicit weak id list", () => {
    expect(isWeakSource(sourceWithId("indie-hackers"))).toBe(true);
  });

  it("treats a curated source as strong", () => {
    expect(isWeakSource(sourceWithId("anthropic-news"))).toBe(false);
  });
});
