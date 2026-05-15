import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
  processEntities: false
});

export interface ParsedFeedItem {
  title?: string;
  link?: string | { href?: string };
  pubDate?: string;
  published?: string;
  updated?: string;
  description?: string;
  summary?: string;
  author?: string | { name?: string };
  category?: string | string[];
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
