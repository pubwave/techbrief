import { sanitizeArticleText } from "@techbrief/shared";
import { load, type CheerioAPI } from "cheerio";
import { extractPublishedAtFromUrl, normalizePublishedAt } from "../shared/date-utils.js";

function readSelectorContent($: CheerioAPI, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const element = $(selector).first();

    if (element.length === 0) {
      continue;
    }

    const content = element.attr("content")?.trim() ?? element.text().trim();
    const normalized = sanitizeArticleText(content);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

export function extractTitle(html: string, selectors: string[]): string | undefined {
  const $ = load(html);
  return readSelectorContent($, selectors);
}

export function extractSummary(html: string, selectors: string[]): string | undefined {
  const $ = load(html);
  return readSelectorContent($, selectors);
}

export function extractAuthor(html: string, selectors: string[]): string | undefined {
  const $ = load(html);
  return readSelectorContent($, selectors);
}

function extractStructuredPublishedAt(html: string): string | undefined {
  const matches = html.matchAll(
    /\\?"(?:datePublished|dateCreated|dateModified|publishedAt|publishedOn|publishDate|firstPublishedAt)\\?"\s*:\s*\\?"([^"\\]+)\\?"/g
  );

  for (const match of matches) {
    const parsed = normalizePublishedAt(match[1]);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

export function extractPublishedAt(html: string, selectors: string[], originalUrl?: string): string | undefined {
  const $ = load(html);
  const value = readSelectorContent($, [
    ...selectors,
    "meta[property='article:published_time']",
    "meta[property='og:published_time']",
    "meta[name='article:published_time']",
    "meta[name='date']",
    "meta[name='publish_date']",
    "meta[name='pubdate']",
    "meta[itemprop='datePublished']",
    "[itemprop='datePublished']"
  ]);

  return normalizePublishedAt(value) ?? extractStructuredPublishedAt(html) ?? (originalUrl ? extractPublishedAtFromUrl(originalUrl) : undefined);
}
