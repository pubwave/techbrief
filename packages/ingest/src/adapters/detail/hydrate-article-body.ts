import type { FeedArticle } from "@techbrief/shared";
import { articleNeedsBodyHydration, shouldReplaceArticleBody } from "@techbrief/shared";
import { extractHtmlBodyContent, GENERIC_BODY_SELECTORS } from "../html/body-content.js";
import { sourceFetchSignal, DETAIL_FETCH_TIMEOUT_MS } from "../shared/fetch-timeout.js";

const DETAIL_FETCH_USER_AGENT = "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)";
const HACKER_NEWS_SOURCE_PREFIX = "hackernews-";

export async function hydrateArticleBody(article: FeedArticle): Promise<FeedArticle> {
  if (shouldTrustOnlySourceBody(article)) {
    return article;
  }

  if (!articleNeedsBodyHydration(article)) {
    return article;
  }

  try {
    const response = await fetch(article.originalUrl, {
      headers: {
        "user-agent": DETAIL_FETCH_USER_AGENT
      },
      signal: sourceFetchSignal(DETAIL_FETCH_TIMEOUT_MS)
    });

    if (!response.ok) {
      return article;
    }

    const html = await response.text();
    const content = extractHtmlBodyContent(html, article.originalUrl, GENERIC_BODY_SELECTORS);
    if (!content.bodyHtml?.trim() || !shouldReplaceArticleBody(article, content.bodyHtml)) {
      return article;
    }

    return {
      ...article,
      bodyRaw: content.bodyHtml,
      ...(article.coverImage ? {} : content.coverImage ? { coverImage: content.coverImage } : {})
    };
  } catch {
    return article;
  }
}

export async function hydrateArticleBodies(articles: FeedArticle[]): Promise<FeedArticle[]> {
  return Promise.all(articles.map((article) => hydrateArticleBody(article)));
}

function shouldTrustOnlySourceBody(article: FeedArticle): boolean {
  return article.sourceId.startsWith(HACKER_NEWS_SOURCE_PREFIX) && article.tags.includes("show_hn");
}
