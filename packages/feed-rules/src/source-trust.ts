import type { SourceDefinition } from "@techbrief/shared";

const WEAK_SOURCE_PREFIXES = ["hashnode-", "devto-", "hackernews-", "product-hunt-"];
const WEAK_SOURCE_IDS = new Set(["indie-hackers"]);

export function isWeakSource(source: SourceDefinition | undefined): boolean {
  if (!source) {
    return true;
  }

  return WEAK_SOURCE_IDS.has(source.id) || WEAK_SOURCE_PREFIXES.some((prefix) => source.id.startsWith(prefix));
}
