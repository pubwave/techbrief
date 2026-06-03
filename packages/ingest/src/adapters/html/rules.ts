import { load } from "cheerio";
import { sanitizeArticleText, type SourceDefinition } from "@techbrief/shared";
import type { HtmlSourceRule } from "./types.js";
import { normalizePublishedAt } from "../shared/date-utils.js";

function buildHackerNewsListingExtractor(html: string): Array<{ title: string; originalUrl: string }> {
  const $ = load(html);
  const items: Array<{ title: string; originalUrl: string }> = [];

  $(".athing").each((_, element) => {
    const link = $(element).find(".titleline > a").first();
    const title = sanitizeArticleText(link.text());
    const originalUrl = link.attr("href")?.trim();

    if (title && originalUrl && !originalUrl.startsWith("item?id=")) {
      items.push({ title, originalUrl });
    }
  });

  return items;
}

function buildAnthropicNewsroomListingExtractor(
  html: string,
  source: SourceDefinition
): Array<{ title: string; originalUrl: string; summary?: string; publishedAt?: string }> {
  const items: Array<{ title: string; originalUrl: string; summary?: string; publishedAt?: string }> = [];
  const $ = load(html);

  $("a[class*='PublicationList'][href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    const title = sanitizeArticleText($(element).find("span[class*='title']").first().text()) ?? sanitizeArticleText($(element).text());
    const publishedAt = normalizePublishedAt($(element).find("time").first().text());

    if (!href || !title || !publishedAt) {
      return;
    }

    items.push({
      title,
      originalUrl: new URL(href, source.homepage).toString(),
      publishedAt
    });
  });

  return items.sort((left, right) => Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? ""));
}

function buildHashnodeTagListingExtractor(
  html: string
): Array<{ title: string; originalUrl: string; summary?: string; author?: string; publishedAt?: string }> {
  const $ = load(html);
  const items: Array<{ title: string; originalUrl: string; summary?: string; author?: string; publishedAt?: string }> = [];
  const seenUrls = new Set<string>();

  $("script[type='application/ld+json']").each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) {
      return;
    }

    try {
      const payload = JSON.parse(raw) as {
        "@type"?: string;
        mainEntity?: {
          itemListElement?: Array<{
            item?: {
              "@type"?: string;
              headline?: string;
              url?: string;
              description?: string;
              datePublished?: string;
              author?: { name?: string };
            };
          }>;
        };
      };

      if (payload["@type"] !== "CollectionPage") {
        return;
      }

      for (const entry of payload.mainEntity?.itemListElement ?? []) {
        const article = entry.item;
        const title = sanitizeArticleText(article?.headline);
        const summary = sanitizeArticleText(article?.description);
        const author = sanitizeArticleText(article?.author?.name);

        if (!title || !article?.url) {
          continue;
        }

        if (seenUrls.has(article.url)) {
          continue;
        }

        seenUrls.add(article.url);

        items.push({
          title,
          originalUrl: article.url,
          ...(summary ? { summary } : {}),
          ...(author ? { author } : {}),
          ...(article.datePublished ? { publishedAt: article.datePublished } : {})
        });
      }
    } catch {
      return;
    }
  });

  return items;
}

const genericRule: HtmlSourceRule = {
  maxArticles: 8,
  articleLinkPatterns: [],
  titleSelectors: ["meta[property='og:title']", "h1", "title"],
  summarySelectors: [
    "meta[name='description']",
    "meta[property='og:description']",
    "article p",
    "main p"
  ],
  bodySelectors: [
    "[itemprop='articleBody']",
    "article",
    "main",
    ".article-content",
    ".article-body",
    ".post-content",
    ".entry-content"
  ],
  authorSelectors: ["meta[name='author']", "[rel='author']", ".author", ".byline"],
  dateSelectors: [
    "meta[property='article:published_time']",
    "meta[name='article:published_time']",
    "time[datetime]",
    "time"
  ],
  useGenericAnchorScan: true
};

export const HTML_SOURCE_RULES: Record<string, HtmlSourceRule> = {
  "anthropic-news": {
    ...genericRule,
    maxArticles: 20,
    articleLinkPatterns: [/\/news\//],
    useGenericAnchorScan: false,
    listingExtractor: (html, source) => buildAnthropicNewsroomListingExtractor(html, source)
  },
  "google-deepmind-blog": {
    ...genericRule,
    articleLinkPatterns: [/\/discover\/blog\//]
  },
  "apple-newsroom": {
    ...genericRule,
    articleLinkPatterns: [/\/newsroom\/\d{4}\//]
  },
  "meta-newsroom": {
    ...genericRule,
    articleLinkPatterns: [/\/news\//]
  },
  wired: {
    ...genericRule,
    articleLinkPatterns: [/\/story\//]
  },
  "mit-technology-review": {
    ...genericRule,
    articleLinkPatterns: [/\d{4}\/\d{2}\/\d{2}\//]
  },
  "stripe-blog": {
    ...genericRule,
    articleLinkPatterns: [/\/blog\//, /\/resources\/more\//]
  },
  "vercel-blog": {
    ...genericRule,
    articleLinkPatterns: [/\/blog\//]
  },
  "shopify-engineering": {
    ...genericRule,
    articleLinkPatterns: [/^\/(?!topics\/|authors\/|latest$|login|partners$)[a-z0-9-]+$/i]
  },
  "indie-hackers": {
    ...genericRule,
    listingUrl: "https://www.indiehackers.com/post",
    articleLinkPatterns: [/\/post\//]
  },
  "devto-build-in-public": {
    ...genericRule,
    articleLinkPatterns: [/^\/[^/]+\/.+/]
  },
  "devto-saas": {
    ...genericRule,
    articleLinkPatterns: [/^\/[^/]+\/.+/]
  },
  "hashnode-indie": {
    ...genericRule,
    listingUrl: "https://hashnode.com/tag/product-launch",
    articleLinkPatterns: [],
    useGenericAnchorScan: false,
    listingExtractor: (html) => buildHashnodeTagListingExtractor(html)
  },
  "hashnode-saas": {
    ...genericRule,
    listingUrl: "https://hashnode.com/n/saas",
    articleLinkPatterns: [],
    useGenericAnchorScan: false,
    listingExtractor: (html) => buildHashnodeTagListingExtractor(html)
  },
  "hackernews-frontpage": {
    ...genericRule,
    articleLinkPatterns: [],
    maxArticles: 12,
    useGenericAnchorScan: false,
    listingExtractor: (html) => buildHackerNewsListingExtractor(html)
  },
  "hackernews-show-hn": {
    ...genericRule,
    articleLinkPatterns: [],
    maxArticles: 12,
    useGenericAnchorScan: false,
    listingExtractor: (html) => buildHackerNewsListingExtractor(html)
  },
  "hackernews-launch-hn": {
    ...genericRule,
    articleLinkPatterns: [],
    maxArticles: 12,
    useGenericAnchorScan: false,
    listingExtractor: (html) => buildHackerNewsListingExtractor(html)
  }
};

export function getHtmlSourceRule(source: SourceDefinition): HtmlSourceRule | null {
  return HTML_SOURCE_RULES[source.id] ?? null;
}
