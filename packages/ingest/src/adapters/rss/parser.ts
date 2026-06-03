import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
  processEntities: false
});

export interface ParsedFeedItem {
  [key: string]: unknown;
  title?: string;
  link?: string | { href?: string; rel?: string } | Array<{ href?: string; rel?: string }>;
  pubDate?: string;
  published?: string;
  updated?: string;
  description?: string;
  summary?: string;
  author?: string | { name?: string };
  category?: string | { term?: string } | Array<string | { term?: string }>;
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: ParsedFeedItem | ParsedFeedItem[] } };
    feed?: { entry?: ParsedFeedItem | ParsedFeedItem[] };
  };

  if (parsed.rss?.channel?.item) {
    return Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
  }

  if (parsed.feed?.entry) {
    return Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
  }

  return [];
}
