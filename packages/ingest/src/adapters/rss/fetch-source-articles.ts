import type { FeedArticle } from "@techbrief/shared";
import type { FetchSourceArticlesInput, FetchSourceArticlesResult } from "./types.js";
import { parseFeed } from "./parser.js";
import { mapFeedItemToArticle } from "./map-item.js";
import { isFresh, sortByPublishedDate } from "../shared/article-utils.js";
import { formatFetchError } from "../shared/fetch-error.js";
import { sourceFetchSignal } from "../shared/fetch-timeout.js";

export async function fetchSourceArticles({ source, freshnessDays }: FetchSourceArticlesInput): Promise<FetchSourceArticlesResult> {
  if (!source.feedUrl) {
    return {
      articles: [],
      skippedReason: "Source does not expose an RSS or Atom feed yet."
    };
  }

  try {
    const response = await fetch(source.feedUrl, {
      headers: {
        "user-agent": "TechBriefBot/0.1 (+https://github.com/pubwave/techbrief)"
      },
      signal: sourceFetchSignal()
    });

    if (!response.ok) {
      return {
        articles: [],
        skippedReason: `Feed request failed with status ${response.status}.`
      };
    }

    const xml = await response.text();
    const articles = parseFeed(xml)
      .map((item) => mapFeedItemToArticle(source, item))
      .filter((item): item is FeedArticle => item !== null)
      .filter((item) => isFresh(item.publishedAt, freshnessDays));

    return {
      articles: sortByPublishedDate(articles)
    };
  } catch (error) {
    return {
      articles: [],
      skippedReason: formatFetchError(error)
    };
  }
}
