import { describe, expect, it } from "vitest";
import { applyFeedRules } from "../../packages/feed-rules/src/filter.js";
import { makeArticle, makeSource } from "../_fixtures.js";

const source = makeSource({ id: "src-1" });
const sources = [source];

function withBody(overrides = {}) {
  return makeArticle({ sourceId: "src-1", bodyRaw: "a usable body", ...overrides });
}

describe("applyFeedRules", () => {
  it("keeps a valid article", async () => {
    const result = await applyFeedRules({ sources, articles: [withBody()] });
    expect(result.articles).toHaveLength(1);
    expect(result.filtered).toHaveLength(0);
  });

  it("drops an invalid url", async () => {
    const result = await applyFeedRules({ sources, articles: [withBody({ originalUrl: "not a url" })] });
    expect(result.articles).toHaveLength(0);
    expect(result.filtered[0]?.reason).toBe("invalid-url");
  });

  it("drops an empty title", async () => {
    const result = await applyFeedRules({ sources, articles: [withBody({ title: "   " })] });
    expect(result.filtered[0]?.reason).toBe("invalid-title");
  });

  it("drops an unparseable published date", async () => {
    const result = await applyFeedRules({ sources, articles: [withBody({ publishedAt: "nope" })] });
    expect(result.filtered[0]?.reason).toBe("invalid-published-at");
  });

  it("drops an article with no body", async () => {
    const result = await applyFeedRules({ sources, articles: [makeArticle({ sourceId: "src-1" })] });
    expect(result.filtered[0]?.reason).toBe("invalid-body");
  });

  it("dedupes by normalized url and keeps the richer article", async () => {
    const plain = withBody({ id: "a", originalUrl: "https://example.com/post" });
    const withSummary = withBody({ id: "b", originalUrl: "https://example.com/post?utm_source=x", summary: "richer" });
    const result = await applyFeedRules({ sources, articles: [plain, withSummary] });
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]?.summary).toBe("richer");
    expect(result.filtered[0]?.reason).toBe("duplicate-normalized-url");
  });

  it("dedupes by content hash within the time window", async () => {
    const first = withBody({ id: "a", originalUrl: "https://example.com/one", bodyRaw: "identical body content" });
    const second = withBody({ id: "b", originalUrl: "https://example.com/two", bodyRaw: "identical body content" });
    const result = await applyFeedRules({ sources, articles: [first, second] });
    expect(result.articles).toHaveLength(1);
    expect(result.filtered[0]?.reason).toBe("duplicate-content-hash");
  });

  it("blocks weak-source nav urls and titles", async () => {
    const weak = makeSource({ id: "hashnode-blog" });
    const navUrl = withBody({ sourceId: "hashnode-blog", originalUrl: "https://example.com/login" });
    const navTitle = withBody({ sourceId: "hashnode-blog", originalUrl: "https://example.com/ok", title: "Sign in" });
    const result = await applyFeedRules({ sources: [weak], articles: [navUrl, navTitle] });
    expect(result.articles).toHaveLength(0);
    expect(result.filtered.map((f) => f.reason)).toEqual(
      expect.arrayContaining(["blocked-weak-source-url", "blocked-weak-source-title"])
    );
  });

  it("returns kept articles newest first", async () => {
    const older = withBody({ id: "a", originalUrl: "https://example.com/old", publishedAt: "2024-01-01T00:00:00Z" });
    const newer = withBody({ id: "b", originalUrl: "https://example.com/new", publishedAt: "2024-06-01T00:00:00Z" });
    const result = await applyFeedRules({ sources, articles: [older, newer] });
    expect(result.articles.map((a) => a.originalUrl)).toEqual([
      "https://example.com/new",
      "https://example.com/old"
    ]);
  });

  it("invokes the onFiltered callback for each drop", async () => {
    const reasons: string[] = [];
    await applyFeedRules({
      sources,
      articles: [withBody({ originalUrl: "not a url" })],
      onFiltered: (entry) => {
        reasons.push(entry.reason);
      }
    });
    expect(reasons).toEqual(["invalid-url"]);
  });
});
