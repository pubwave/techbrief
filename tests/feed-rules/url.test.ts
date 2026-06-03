import { describe, expect, it } from "vitest";
import { normalizeArticleUrl } from "../../packages/feed-rules/src/url.js";

describe("normalizeArticleUrl", () => {
  it("returns null for an invalid url", () => {
    expect(normalizeArticleUrl("not a url")).toBeNull();
  });

  it("strips the hash fragment", () => {
    expect(normalizeArticleUrl("https://example.com/post#section")).toBe("https://example.com/post");
  });

  it("lowercases the hostname", () => {
    expect(normalizeArticleUrl("https://Example.COM/post")).toBe("https://example.com/post");
  });

  it("removes tracking params but keeps real ones", () => {
    expect(normalizeArticleUrl("https://example.com/post?utm_source=hn&id=42&gclid=x")).toBe(
      "https://example.com/post?id=42"
    );
  });

  it("trims a trailing slash from non-root paths", () => {
    expect(normalizeArticleUrl("https://example.com/post/")).toBe("https://example.com/post");
  });

  it("keeps the root path slash", () => {
    expect(normalizeArticleUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("strips the hashnode id suffix so the same article dedupes", () => {
    expect(normalizeArticleUrl("https://blog.hashnode.dev/my-title-123-deadbeef")).toBe(
      "https://blog.hashnode.dev/my-title-123"
    );
  });
});
