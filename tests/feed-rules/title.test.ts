import { describe, expect, it } from "vitest";
import { createTitleFingerprint, isBlockedWeakSourceTitle, normalizeWhitespace } from "../../packages/feed-rules/src/title.js";

describe("normalizeWhitespace", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeWhitespace("  a\n b\tc ")).toBe("a b c");
  });
});

describe("createTitleFingerprint", () => {
  it("lowercases and strips punctuation/symbols", () => {
    expect(createTitleFingerprint("Hello, World!")).toBe("hello world");
  });

  it("matches titles that differ only by punctuation or case", () => {
    expect(createTitleFingerprint("Show HN: My App")).toBe(createTitleFingerprint("show hn my app"));
  });
});

describe("isBlockedWeakSourceTitle", () => {
  it("blocks empty/whitespace titles", () => {
    expect(isBlockedWeakSourceTitle("   ")).toBe(true);
  });

  it("blocks boilerplate nav titles", () => {
    expect(isBlockedWeakSourceTitle("Sign in")).toBe(true);
    expect(isBlockedWeakSourceTitle("Privacy Policy")).toBe(true);
    expect(isBlockedWeakSourceTitle("Search")).toBe(true);
  });

  // NOTE: the domain-blocklist branch in title.ts is currently dead — the
  // fingerprint strips the dot ("example.com" -> "examplecom"), so the
  // `^...\.(dev|com|...)$` regex never matches. This documents actual behavior.
  it("does not block a bare domain once it is long enough (fingerprint strips the dot)", () => {
    expect(isBlockedWeakSourceTitle("example.com")).toBe(false);
  });

  it("blocks titles that are too short", () => {
    expect(isBlockedWeakSourceTitle("hi")).toBe(true);
  });

  it("allows a normal article title", () => {
    expect(isBlockedWeakSourceTitle("How we cut our build time in half")).toBe(false);
  });
});
