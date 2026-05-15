import type { SourceDefinition } from "@techbrief/shared";
import type { ApiSourceRule } from "./types.js";

export const API_SOURCE_RULES: Record<string, ApiSourceRule> = {
  "devto-build-in-public": {
    endpoint: "https://dev.to/api/articles?tag=buildinpublic&state=all&per_page=20"
  },
  "devto-saas": {
    endpoint: "https://dev.to/api/articles?tag=saas&state=all&per_page=20"
  },
  "hackernews-frontpage": {
    endpoint: "https://hn.algolia.com/api/v1/search?tags=front_page"
  },
  "hackernews-show-hn": {
    endpoint: "https://hn.algolia.com/api/v1/search_by_date?tags=show_hn"
  },
  "hackernews-launch-hn": {
    endpoint: "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=Launch%20HN%3A",
    sourceNote: "Launch HN uses a public Algolia query approximation because HN Search does not expose a dedicated launch_hn tag."
  }
};

export function getApiSourceRule(source: SourceDefinition): ApiSourceRule | null {
  return API_SOURCE_RULES[source.id] ?? null;
}
