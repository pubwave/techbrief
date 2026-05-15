import type {
  CustomSourceInput,
  SourceDefinition,
  SourceValidationIssue,
  SourceValidationResult
} from "./types.js";
import type { ContentType } from "../content/types.js";

const TECH_KEYWORDS = ["ai", "cloud", "developer", "engineering", "startup", "tech", "software"];
const INDIE_KEYWORDS = ["build", "founder", "indie", "launch", "maker", "saas", "solo"];

export function createSourceId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateCustomSource(input: CustomSourceInput): SourceValidationResult {
  const issues = [
    ...validateName(input.name),
    ...validateHomepage(input.homepage),
    ...validateFeedUrl(input.feedUrl)
  ];
  const inferredCategory = inferCategory(input);

  if (inferredCategory !== "unknown" && inferredCategory !== input.category) {
    issues.push({
      code: "source.category_mismatch",
      message: `Selected category '${input.category}' does not match inferred category '${inferredCategory}'.`
    });
  }

  return {
    accepted: issues.length === 0,
    declaredCategory: input.category,
    inferredCategory,
    issues
  };
}

export function toCustomSourceDefinition(input: CustomSourceInput): SourceDefinition {
  const id = createSourceId(input.name);

  const source: SourceDefinition = {
    id,
    name: input.name,
    category: input.category,
    preset: "custom",
    state: "custom-pending",
    access: "public",
    homepage: input.homepage,
    discoveryMethod: inferDiscoveryMethod(input),
    linkScope: "same-site",
    description: `${input.name} custom source`,
    tags: [input.category, "custom"]
  };

  if (input.feedUrl) {
    source.feedUrl = input.feedUrl;
  }

  return source;
}

function inferCategory(input: CustomSourceInput): ContentType | "unknown" {
  const haystack = `${input.name} ${input.homepage}`.toLowerCase();

  if (INDIE_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return "indie-dev";
  }

  if (TECH_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return "tech-news";
  }

  return "unknown";
}

function validateHomepage(homepage: string): SourceValidationIssue[] {
  try {
    const parsed = new URL(homepage);

    if (parsed.protocol !== "https:") {
      return [{ code: "source.invalid_protocol", message: "Homepage must use https." }];
    }

    return [];
  } catch {
    return [{ code: "source.invalid_url", message: "Homepage must be a valid URL." }];
  }
}

function validateFeedUrl(feedUrl?: string): SourceValidationIssue[] {
  if (!feedUrl) {
    return [];
  }

  try {
    new URL(feedUrl);
    return [];
  } catch {
    return [{ code: "source.invalid_feed_url", message: "Feed URL must be a valid URL." }];
  }
}

function validateName(name: string): SourceValidationIssue[] {
  if (name.trim().length < 3) {
    return [{ code: "source.name_too_short", message: "Source name must be at least 3 characters." }];
  }

  return [];
}

function inferDiscoveryMethod(input: CustomSourceInput): SourceDefinition["discoveryMethod"] {
  if (input.discoveryMethodPreference && input.discoveryMethodPreference !== "auto") {
    return input.discoveryMethodPreference;
  }

  if (input.feedUrl) {
    return "rss";
  }

  try {
    const hostname = new URL(input.homepage).hostname;

    if (hostname === "dev.to" || hostname === "news.ycombinator.com" || hostname.endsWith("hashnode.dev")) {
      return "api";
    }
  } catch {
    return "html";
  }

  return "html";
}
