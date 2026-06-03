import { describe, expect, it } from "vitest";
import { mapFeedItemToArticle } from "../../packages/ingest/src/adapters/rss/map-item.js";
import { makeSource } from "../_fixtures.js";

const source = makeSource({ id: "src-1", name: "Source One", homepage: "https://example.com", linkScope: "external-allowed" });

describe("mapFeedItemToArticle", () => {
  it("maps a valid item", () => {
    const article = mapFeedItemToArticle(source, {
      title: "Hello world",
      link: "https://example.com/post",
      pubDate: "2024-03-01T00:00:00Z",
      description: "a short description",
      author: "Jane",
      category: ["ai", "dev"]
    });
    expect(article).not.toBeNull();
    expect(article?.title).toBe("Hello world");
    expect(article?.originalUrl).toBe("https://example.com/post");
    expect(article?.publishedAt).toBe("2024-03-01T00:00:00.000Z");
    expect(article?.sourceId).toBe("src-1");
    expect(article?.language).toBe("en");
    expect(article?.author).toBe("Jane");
    expect(article?.tags).toEqual(["ai", "dev"]);
    expect(article?.bodyRaw).toContain("a short description");
  });

  it("returns null when the title is missing", () => {
    expect(mapFeedItemToArticle(source, { link: "https://example.com/x", pubDate: "2024-03-01" })).toBeNull();
  });

  it("returns null when the link is missing", () => {
    expect(mapFeedItemToArticle(source, { title: "x", pubDate: "2024-03-01" })).toBeNull();
  });

  it("returns null when the date is missing/unparseable", () => {
    expect(mapFeedItemToArticle(source, { title: "x", link: "https://example.com/x", pubDate: "nope" })).toBeNull();
  });

  it("rejects an off-site link for a same-site source", () => {
    const sameSite = makeSource({ homepage: "https://example.com", linkScope: "same-site" });
    expect(
      mapFeedItemToArticle(sameSite, { title: "x", link: "https://evil.com/x", pubDate: "2024-03-01" })
    ).toBeNull();
  });

  it("normalizes an Atom-style link array", () => {
    const article = mapFeedItemToArticle(source, {
      title: "Atom",
      link: [{ href: "https://example.com/atom", rel: "alternate" }],
      published: "2024-03-01"
    });
    expect(article?.originalUrl).toBe("https://example.com/atom");
  });
});
