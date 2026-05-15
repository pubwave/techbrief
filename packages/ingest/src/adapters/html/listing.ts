import { load } from "cheerio";
import { sanitizeArticleText, type SourceDefinition } from "@techbrief/shared";
import { normalizeArticleUrl } from "@techbrief/feed-rules";
import type { HtmlArticleCandidate, HtmlSourceRule } from "./types.js";

function toAbsoluteUrl(input: string, source: SourceDefinition): string {
  try {
    return new URL(input, source.homepage).toString();
  } catch {
    return input;
  }
}

function matchesPatterns(url: string, patterns: RegExp[]): boolean {
  if (patterns.length === 0) {
    return true;
  }

  return patterns.some((pattern) => pattern.test(url));
}

export function extractArticleCandidates(html: string, source: SourceDefinition, rule: HtmlSourceRule): HtmlArticleCandidate[] {
  if (rule.listingExtractor) {
    return dedupeCandidatesByNormalizedUrl(rule.listingExtractor(html, source).map((item) => ({
      ...(item.title ? { title: item.title } : {}),
      ...(item.summary ? { summary: item.summary } : {}),
      ...(item.author ? { author: item.author } : {}),
      ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
      originalUrl: toAbsoluteUrl(item.originalUrl, source)
    })));
  }

  const $ = load(html);
  const candidates: HtmlArticleCandidate[] = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href) {
      return;
    }

    const absoluteUrl = toAbsoluteUrl(href, source);
    const isHttpUrl = absoluteUrl.startsWith("http://") || absoluteUrl.startsWith("https://");

    if (!isHttpUrl || !matchesPatterns(absoluteUrl, rule.articleLinkPatterns)) {
      return;
    }

    const title = sanitizeArticleText($(element).text()) ?? undefined;
    candidates.push({
      ...(title ? { title } : {}),
      originalUrl: absoluteUrl
    });
  });

  return dedupeCandidatesByNormalizedUrl(candidates);
}

function dedupeCandidatesByNormalizedUrl(candidates: HtmlArticleCandidate[]): HtmlArticleCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const normalizedUrl = normalizeArticleUrl(candidate.originalUrl) ?? candidate.originalUrl;
    if (seen.has(normalizedUrl)) {
      return false;
    }

    seen.add(normalizedUrl);
    return true;
  });
}
