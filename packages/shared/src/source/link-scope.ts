import type { SourceDefinition, SourceLinkScope } from "./types.js";

export function resolveSourceLinkScope(source: SourceDefinition): SourceLinkScope {
  return source.linkScope ?? "same-site";
}

export function isArticleLinkAllowedForSource(source: SourceDefinition, articleUrl: string): boolean {
  if (resolveSourceLinkScope(source) === "external-allowed") {
    return true;
  }

  try {
    const sourceHost = new URL(source.homepage).hostname;
    const articleHost = new URL(articleUrl).hostname;
    return buildSiteKey(sourceHost) === buildSiteKey(articleHost);
  } catch {
    return false;
  }
}

function buildSiteKey(hostname: string): string {
  const normalized = hostname.toLowerCase().replace(/\.+$/, "");
  const labels = normalized.split(".").filter(Boolean);
  if (labels.length <= 2) {
    return normalized;
  }

  const tld = labels.at(-1) ?? "";
  const secondLevel = labels.at(-2) ?? "";
  const useThreeLabels = tld.length === 2 && secondLevel.length <= 3 && labels.length >= 3;
  return labels.slice(useThreeLabels ? -3 : -2).join(".");
}
