import { load, type Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";

export const GENERIC_BODY_SELECTORS = [
  "[itemprop='articleBody']",
  "article",
  "main",
  ".article-content",
  ".article-body",
  ".post-content",
  ".entry-content"
];

const NOISE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "svg",
  "form",
  "button",
  "input",
  "select",
  "textarea",
  "nav",
  "footer",
  "aside",
  ".related",
  ".recommended",
  ".newsletter",
  ".subscribe",
  ".social-share",
  ".share",
  ".advertisement",
  ".ads",
  ".ad"
].join(", ");

export interface HtmlBodyContent {
  bodyHtml?: string;
  coverImage?: string;
}

export function extractHtmlBodyContent(html: string, pageUrl: string, selectors: string[]): HtmlBodyContent {
  const $ = load(html);
  const selected = selectBestContentElement($, selectors);
  const fallbackCoverImage = extractCoverImage($, pageUrl);

  if (!selected) {
    return createBodyContent(undefined, fallbackCoverImage);
  }

  const selectedHtml = $.html(selected).trim();
  if (!selectedHtml) {
    return createBodyContent(undefined, fallbackCoverImage);
  }

  const fragment = load(selectedHtml);
  const root = fragment.root().children().first();
  cleanupContent(fragment, root);
  absolutizeContentUrls(fragment, root, pageUrl);

  const bodyHtml = (fragment.html(root) ?? "").trim();
  if (!bodyHtml || !hasMeaningfulBodyContent(fragment, root)) {
    return createBodyContent(undefined, fallbackCoverImage);
  }

  return createBodyContent(bodyHtml, extractCoverImage($, pageUrl, root));
}

function selectBestContentElement($: ReturnType<typeof load>, selectors: string[]): Cheerio<AnyNode> | null {
  const seen = new Set<AnyNode>();
  const candidates: Array<{ element: AnyNode; score: number }> = [];

  for (const selector of [...selectors, ...GENERIC_BODY_SELECTORS]) {
    $(selector).each((_, element) => {
      if (seen.has(element)) {
        return;
      }

      seen.add(element);
      const score = scoreContentElement($(element));
      if (score <= 0) {
        return;
      }

      candidates.push({ element, score });
    });
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates.length > 0 ? $(candidates[0]!.element) : null;
}

function scoreContentElement(element: Cheerio<AnyNode>): number {
  const textLength = normalizeWhitespace(element.text()).length;
  const paragraphCount = element.find("p").length;
  const imageCount = element.find("img").length;
  const headingCount = element.find("h1, h2, h3, h4, h5, h6").length;
  const listCount = element.find("ul, ol").length;

  if (textLength < 120) {
    return 0;
  }

  return textLength
    + paragraphCount * 400
    + imageCount * 200
    + headingCount * 120
    + listCount * 80;
}

function cleanupContent($: ReturnType<typeof load>, element: Cheerio<AnyNode>): void {
  element.find(NOISE_SELECTORS).remove();
  element.find("[aria-hidden='true']").remove();

  element.find("*").each((_, node) => {
    const current = $(node);
    const className = current.attr("class") ?? "";
    const id = current.attr("id") ?? "";
    const marker = `${className} ${id}`.toLowerCase();
    if (/(related|recommend|newsletter|subscribe|share|advert|promo|cookie|social)/.test(marker)) {
      current.remove();
    }
  });
}

function absolutizeContentUrls($: ReturnType<typeof load>, element: Cheerio<AnyNode>, pageUrl: string): void {
  element.find("img").each((_, node) => normalizeImageSource($(node)));
  element.find("img").each((_, node) => absolutizeAttribute($(node), "src", pageUrl));
  element.find("img").each((_, node) => absolutizeSrcSet($(node), pageUrl));
  element.find("a").each((_, node) => absolutizeAttribute($(node), "href", pageUrl));
  element.find("iframe").each((_, node) => absolutizeAttribute($(node), "src", pageUrl));
}

function extractCoverImage(
  $: ReturnType<typeof load>,
  pageUrl: string,
  content?: Cheerio<AnyNode>
): string | undefined {
  const metaImage = $("meta[property='og:image'], meta[name='twitter:image']").first().attr("content")?.trim();
  if (metaImage) {
    return toAbsoluteUrl(metaImage, pageUrl);
  }

  const contentImage = content?.find("img").first().attr("src")?.trim();
  return contentImage ? toAbsoluteUrl(contentImage, pageUrl) : undefined;
}

function absolutizeAttribute(element: Cheerio<AnyNode>, attribute: string, pageUrl: string): void {
  const value = element.attr(attribute)?.trim();
  if (!value) {
    return;
  }

  const absoluteUrl = toAbsoluteUrl(value, pageUrl);
  if (absoluteUrl) {
    element.attr(attribute, absoluteUrl);
  }
}

function absolutizeSrcSet(element: Cheerio<AnyNode>, pageUrl: string): void {
  const srcSet = element.attr("srcset")?.trim();
  if (!srcSet) {
    return;
  }

  const normalized = srcSet
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      const url = parts.shift();
      if (!url) {
        return null;
      }

      const absoluteUrl = toAbsoluteUrl(url, pageUrl);
      if (!absoluteUrl) {
        return null;
      }

      return [absoluteUrl, ...parts].join(" ");
    })
    .filter((entry): entry is string => Boolean(entry))
    .join(", ");

  if (normalized) {
    element.attr("srcset", normalized);
  }
}

function normalizeImageSource(element: Cheerio<AnyNode>): void {
  const currentSrc = element.attr("src")?.trim();
  if (currentSrc) {
    return;
  }

  const lazySource = element.attr("data-src")?.trim()
    ?? element.attr("data-original")?.trim()
    ?? element.attr("data-lazy-src")?.trim();

  if (lazySource) {
    element.attr("src", lazySource);
  }
}

function toAbsoluteUrl(value: string, pageUrl: string): string | undefined {
  try {
    return new URL(value, pageUrl).toString();
  } catch {
    return undefined;
  }
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function hasMeaningfulBodyContent($: ReturnType<typeof load>, element: Cheerio<AnyNode>): boolean {
  const textLength = normalizeWhitespace(element.text()).length;
  if (textLength > 0) {
    return true;
  }

  return element.find("img, video, iframe, pre, code, blockquote, table, ul, ol").length > 0;
}

function createBodyContent(bodyHtml?: string, coverImage?: string): HtmlBodyContent {
  return {
    ...(bodyHtml ? { bodyHtml } : {}),
    ...(coverImage ? { coverImage } : {})
  };
}
