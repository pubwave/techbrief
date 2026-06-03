import { load } from "cheerio";
import { isArticleLinkAllowedForSource, sanitizeArticleText, type SourceDefinition } from "@techbrief/shared";
import { normalizeArticleUrl } from "@techbrief/feed-rules";
import type { HtmlArticleCandidate, HtmlSourceRule } from "./types.js";
import { extractPublishedAtFromUrl, normalizePublishedAt } from "../shared/date-utils.js";

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

  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    // Keep the raw URL candidate for malformed or relative inputs.
  }

  return patterns.some((pattern) => pattern.test(url) || pattern.test(pathname));
}

function isSamePageAnchor(url: string, source: SourceDefinition): boolean {
  try {
    const candidate = new URL(url);
    const homepage = new URL(source.homepage);
    return candidate.origin === homepage.origin && candidate.pathname === homepage.pathname && Boolean(candidate.hash);
  } catch {
    return false;
  }
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

    if (
      !isHttpUrl ||
      !isArticleLinkAllowedForSource(source, absoluteUrl) ||
      isSamePageAnchor(absoluteUrl, source) ||
      !matchesPatterns(absoluteUrl, rule.articleLinkPatterns)
    ) {
      return;
    }

    const dateElement = $(element).find("time").first();
    const contextDateElement = $(element).closest("article, li, section, div").find("time").first();
    const dateSource = dateElement.length > 0 ? dateElement : contextDateElement;
    const publishedAt = normalizePublishedAt(dateSource.attr("datetime")?.trim() ?? dateSource.text().trim()) ?? extractPublishedAtFromUrl(absoluteUrl);
    const titleElement = $(element).find("h1, h2, h3, h4, h5, h6").first();
    const title = sanitizeArticleText(titleElement.length > 0 ? titleElement.text() : $(element).text()) ?? undefined;
    candidates.push({
      ...(title ? { title } : {}),
      ...(publishedAt ? { publishedAt } : {}),
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
