import { fetchApiSourceArticles } from "./api/fetch-source-articles.js";
import type { FetchSourceArticlesInput, FetchSourceArticlesResult } from "./rss/types.js";
import { fetchHtmlSourceArticles } from "./html/fetch-source-articles.js";
import { fetchSourceArticles as fetchRssSourceArticles } from "./rss/fetch-source-articles.js";

export async function fetchSourceArticles(input: FetchSourceArticlesInput): Promise<FetchSourceArticlesResult> {
  switch (input.source.discoveryMethod) {
    case "html":
      return fetchHtmlSourceArticles(input);
    case "api":
      return fetchApiSourceArticles(input);
    case "rss":
    default:
      return fetchRssSourceArticles(input);
  }
}
