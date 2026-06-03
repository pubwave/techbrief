import { describe, expect, it } from "vitest";
import { parseFeed } from "../../packages/ingest/src/adapters/rss/parser.js";

describe("parseFeed", () => {
  it("parses an RSS channel with multiple items", () => {
    const xml = `<?xml version="1.0"?><rss><channel>
      <item><title>One</title><link>https://x/1</link></item>
      <item><title>Two</title><link>https://x/2</link></item>
    </channel></rss>`;
    const items = parseFeed(xml);
    expect(items).toHaveLength(2);
    expect(items[0]?.title).toBe("One");
  });

  it("wraps a single RSS item into an array", () => {
    const xml = `<rss><channel><item><title>Only</title><link>https://x/1</link></item></channel></rss>`;
    const items = parseFeed(xml);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Only");
  });

  it("parses an Atom feed's entries", () => {
    const xml = `<feed><entry><title>Atom</title></entry><entry><title>Two</title></entry></feed>`;
    const items = parseFeed(xml);
    expect(items.map((i) => i.title)).toEqual(["Atom", "Two"]);
  });

  it("returns an empty array for non-feed xml", () => {
    expect(parseFeed("<html><body>nope</body></html>")).toEqual([]);
  });
});
