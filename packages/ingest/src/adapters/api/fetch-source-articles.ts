import { fetchDevToArticles } from "./devto.js";
import { fetchHashnodePublicationArticles } from "./hashnode.js";
import { fetchHackerNewsArticles } from "./hacker-news.js";
import { getApiSourceRule } from "./rules.js";
import type { FetchApiSourceArticlesInput, FetchApiSourceArticlesResult } from "./types.js";
import { formatFetchError } from "../shared/fetch-error.js";

export async function fetchApiSourceArticles({
  source,
  freshnessDays
}: FetchApiSourceArticlesInput): Promise<FetchApiSourceArticlesResult> {
  const rule = getApiSourceRule(source);

  if (!rule) {
    return {
      articles: [],
      skippedReason: `No API adapter rule is registered for source '${source.id}'.`
    };
  }

  try {
    if (new URL(source.homepage).host.endsWith("hashnode.dev")) {
      return {
        articles: await fetchHashnodePublicationArticles(source, freshnessDays)
      };
    }

    if (source.id.startsWith("devto-")) {
      return {
        articles: await fetchDevToArticles(source, freshnessDays, rule)
      };
    }

    if (source.id.startsWith("hackernews-")) {
      return {
        articles: await fetchHackerNewsArticles(source, freshnessDays, rule)
      };
    }

    return {
      articles: [],
      skippedReason: `No API handler is implemented for source '${source.id}'.`
    };
  } catch (error) {
    return {
      articles: [],
      skippedReason: formatFetchError(error)
    };
  }
}
