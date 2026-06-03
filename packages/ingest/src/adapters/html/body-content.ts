import { load, type Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";

export const GENERIC_BODY_SELECTORS = [
  "[itemprop='articleBody']",
  "#article-body",
  ".article-body",
  ".article__body",
  ".article-content",
  ".article__content",
  ".articleBody",
  "[class*='article-body-component']",
  ".c-articleContent",
  ".c-ShortcodeContent",
  ".post-body",
  "article",
  "main",
  ".post-content",
  ".post__content",
  ".wp-block-post-content",
  ".story-body",
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
  "header",
  "footer",
  "aside",
  "[role='banner']",
  ".related",
  ".recommended",
  ".newsletter",
  ".subscribe",
  ".social-share",
  ".share",
  ".social",
  ".follow",
  ".comments",
  ".comment",
  ".author",
  ".byline",
  ".tags",
  ".tag-list",
  ".post-tags",
  ".article-tags",
  ".article-meta",
  ".entry-meta",
  ".crayons-article__header",
  ".crayons-article__subheader",
  ".crayons-article__actions",
  ".crayons-article__footer",
  ".advertisement",
  ".ads",
  ".ad"
].join(", ");

const CONTENT_MARKER_PATTERN = /(article[-_]?body|article[-_]?body[-_]?component|article[-_]?content|post[-_]?body|post[-_]?content|entry[-_]?content|story[-_]?body|content[-_]?body)/i;
const CHROME_MARKER_PATTERN = /(header|meta|byline|author|tag-list|tags|share|social|follow|comment|reaction|breadcrumb|sidebar|footer|promo|newsletter|subscribe|advert|related|recommended|timestamp|lede|concert)/i;
const EMBEDDED_WIDGET_MARKER_PATTERN = /(carousel|jwp|video|player|person-wrapper|slice-container-person)/i;
const NOISE_TEXT_PATTERN = /^(advertisement(?:\s*-\s*scroll for more content)?|follow\s+.+preferred source.+)$/i;

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
  const preferred = selectBestContentElementForSelectors($, selectors);
  if (preferred) {
    return preferred;
  }

  return selectBestContentElementForSelectors($, GENERIC_BODY_SELECTORS);
}

function selectBestContentElementForSelectors($: ReturnType<typeof load>, selectors: string[]): Cheerio<AnyNode> | null {
  const seen = new Set<AnyNode>();
  const candidates: Array<{ element: AnyNode; score: number; textLength: number; depth: number }> = [];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      collectContentCandidates($, element, candidates, seen);
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((left, right) => right.score - left.score);
  const best = candidates[0]!;
  const contentFocused = candidates
    .filter((candidate) =>
      candidate.element !== best.element
      && CONTENT_MARKER_PATTERN.test(elementMarker($(candidate.element)))
      && candidate.score >= best.score * 0.35
    )
    .sort((left, right) => right.score - left.score)[0];
  if (contentFocused) {
    return $(contentFocused.element);
  }

  const focused = candidates
    .filter((candidate) =>
      candidate.element !== best.element
      && candidate.depth > best.depth
      && candidate.score >= best.score * 0.72
      && candidate.textLength <= best.textLength * 0.95
    )
    .sort((left, right) => {
      if (right.depth !== left.depth) return right.depth - left.depth;
      return right.score - left.score;
    })[0];

  return $(focused?.element ?? best.element);
}

function scoreContentElement(element: Cheerio<AnyNode>): number {
  const scoringElement = element.clone();
  cleanupContentForScoring(scoringElement);

  const textLength = normalizeWhitespace(scoringElement.text()).length;
  const paragraphCount = scoringElement.find("p").length;
  const imageCount = scoringElement.find("img").length;
  const headingCount = scoringElement.find("h1, h2, h3, h4, h5, h6").length;
  const listCount = scoringElement.find("ul, ol").length;

  if (textLength < 120) {
    return 0;
  }

  const marker = elementMarker(element);
  const contentAffinity = CONTENT_MARKER_PATTERN.test(marker) ? 900 : 0;
  const chromePenalty = CHROME_MARKER_PATTERN.test(marker) ? 1200 : 0;
  const widgetPenalty = EMBEDDED_WIDGET_MARKER_PATTERN.test(marker) ? 1600 : 0;

  return textLength
    + paragraphCount * 400
    + imageCount * 200
    + headingCount * 120
    + listCount * 80
    + contentAffinity
    - chromePenalty
    - widgetPenalty;
}

function collectContentCandidates(
  $: ReturnType<typeof load>,
  element: AnyNode,
  candidates: Array<{ element: AnyNode; score: number; textLength: number; depth: number }>,
  seen: Set<AnyNode>
): void {
  const nodes = [element, ...$(element).find("main, article, section, div").toArray()];
  for (const node of nodes) {
    if (seen.has(node)) {
      continue;
    }

    seen.add(node);
    const current = $(node);
    const score = scoreContentElement(current);
    if (score <= 0) {
      continue;
    }

    candidates.push({
      element: node,
      score,
      textLength: normalizeWhitespace(current.text()).length,
      depth: current.parents().length
    });
  }
}

function cleanupContent($: ReturnType<typeof load>, element: Cheerio<AnyNode>): void {
  element.find(NOISE_SELECTORS).remove();
  element.find("[aria-hidden='true']").remove();

  element.find("*").each((_, node) => {
    const current = $(node);
    const marker = elementMarker(current);
    if (/(related|recommend|newsletter|subscribe|share|advert|promo|cookie|social|follow|comment|reaction|breadcrumb|byline|tag-list|post-tags|article-tags|entry-meta|article-meta|timestamp|lede|concert|carousel|jwp|video|player|person-wrapper|slice-container-person)/.test(marker)) {
      current.remove();
      return;
    }

    if (NOISE_TEXT_PATTERN.test(normalizeWhitespace(current.text()))) {
      current.remove();
    }
  });
}

function cleanupContentForScoring(element: Cheerio<AnyNode>): void {
  element.find(NOISE_SELECTORS).remove();
  element.find("[aria-hidden='true']").remove();
}

function elementMarker(element: Cheerio<AnyNode>): string {
  const attributes = element.attr() ?? {};
  return Object.entries(attributes)
    .map(([key, value]) => `${key} ${String(value)}`)
    .join(" ")
    .toLowerCase();
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
  const contentImage = content?.find("img").first().attr("src")?.trim();
  if (contentImage) {
    return toAbsoluteUrl(contentImage, pageUrl);
  }

  const metaImage = $("meta[property='og:image'], meta[name='twitter:image']").first().attr("content")?.trim();
  if (metaImage) {
    return toAbsoluteUrl(metaImage, pageUrl);
  }

  return undefined;
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
