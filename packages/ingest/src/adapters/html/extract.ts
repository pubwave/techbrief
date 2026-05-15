import { sanitizeArticleText, normalizeWhitespace } from "@techbrief/shared";
import { load, type CheerioAPI } from "cheerio";

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

export function extractPublishedAt(html: string, selectors: string[]): string {
  const $ = load(html);
  const value = readSelectorContent($, selectors);
  const parsed = value ? Date.parse(value) : Number.NaN;

  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString();
  }

  return new Date().toISOString();
}

export function extractBody(html: string, selectors: string[]): string | undefined {
  const $ = load(html);
  const paragraphs: string[] = [];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const text = sanitizeArticleText($(element).text());
      if (text && !paragraphs.includes(text)) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length >= 6) {
      break;
    }
  }

  if (paragraphs.length === 0) {
    return undefined;
  }

  return paragraphs.slice(0, 8).join("\n\n");
}
