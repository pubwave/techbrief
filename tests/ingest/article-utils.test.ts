import { describe, expect, it } from "vitest";
import type { FeedArticle, SourceDefinition } from "@techbrief/shared";
import { createArticleId, isFresh, sortByPublishedDate } from "../../packages/ingest/src/adapters/shared/article-utils.js";

const source = { id: "hackernews" } as SourceDefinition;

function articleAt(publishedAt: string): FeedArticle {
  return { publishedAt } as FeedArticle;
}

describe("isFresh", () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it("keeps today's article within a 1-day window", () => {
    expect(isFresh(new Date(now).toISOString(), 1)).toBe(true);
  });

  it("keeps yesterday's article within a 1-day window (day-based, not rolling 24h)", () => {
    expect(isFresh(new Date(now - day).toISOString(), 1)).toBe(true);
  });

  it("drops an article older than the window", () => {
    expect(isFresh(new Date(now - 5 * day).toISOString(), 1)).toBe(false);
  });

  it("treats future-dated articles as fresh", () => {
    expect(isFresh(new Date(now + 5 * day).toISOString(), 1)).toBe(true);
  });

  it("rejects an unparseable date", () => {
    expect(isFresh("not-a-date", 7)).toBe(false);
  });
});

describe("sortByPublishedDate", () => {
  it("orders newest first without mutating the input", () => {
    const input = [articleAt("2024-01-01T00:00:00Z"), articleAt("2024-03-01T00:00:00Z"), articleAt("2024-02-01T00:00:00Z")];
    const sorted = sortByPublishedDate(input);
    expect(sorted.map((a) => a.publishedAt)).toEqual([
      "2024-03-01T00:00:00Z",
      "2024-02-01T00:00:00Z",
      "2024-01-01T00:00:00Z"
    ]);
    expect(input[0]!.publishedAt).toBe("2024-01-01T00:00:00Z");
  });
});

describe("createArticleId", () => {
  it("is deterministic for the same source and url", () => {
    const url = "https://example.com/post";
    expect(createArticleId(source, url)).toBe(createArticleId(source, url));
  });

  it("ignores tracking params via url normalization", () => {
    const clean = createArticleId(source, "https://example.com/post");
    const tracked = createArticleId(source, "https://example.com/post?utm_source=hn");
    expect(tracked).toBe(clean);
  });

  it("differs by source and by url", () => {
    const other = { id: "devto" } as SourceDefinition;
    expect(createArticleId(source, "https://example.com/a")).not.toBe(createArticleId(other, "https://example.com/a"));
    expect(createArticleId(source, "https://example.com/a")).not.toBe(createArticleId(source, "https://example.com/b"));
  });
});
