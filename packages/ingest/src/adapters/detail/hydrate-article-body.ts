import type { FeedArticle } from "@techbrief/shared";
import { hasArticleSourceBody } from "@techbrief/shared";
import { extractHtmlBodyContent, GENERIC_BODY_SELECTORS } from "../html/body-content.js";

const DETAIL_FETCH_USER_AGENT = "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)";

export async function hydrateArticleBody(article: FeedArticle): Promise<FeedArticle> {
  if (hasArticleSourceBody(article)) {
    return article;
  }

  try {
    const response = await fetch(article.originalUrl, {
      headers: {
        "user-agent": DETAIL_FETCH_USER_AGENT
      }
    });

    if (!response.ok) {
      return article;
    }

    const html = await response.text();
    const content = extractHtmlBodyContent(html, article.originalUrl, GENERIC_BODY_SELECTORS);
    if (!content.bodyHtml?.trim()) {
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
