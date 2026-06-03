import type { ContentType, SourcePreset, SourceState } from "../content/types.js";

export type SourceAccess = "public";
export type SourceDiscoveryMethod = "rss" | "api" | "html";
export type TechNewsSourceKind = "official-site" | "tech-media";
export type SourceLinkScope = "same-site" | "external-allowed";

export interface SourceDefinition {
  id: string;
  name: string;
  category: ContentType;
  preset: SourcePreset;
  state: SourceState;
  access: SourceAccess;
  homepage: string;
  feedUrl?: string;
  discoveryMethod: SourceDiscoveryMethod;
  linkScope?: SourceLinkScope;
  techNewsKind?: TechNewsSourceKind;
  description: string;
  tags: string[];
  // Ranking priority added to a source's articles in the feed sort. Higher =
  // ranked higher. Default per built-in source below; custom sources default 10.
  priority: number;
}

export interface SourceValidationIssue {
  code: string;
  message: string;
}

export interface SourceValidationResult {
  accepted: boolean;
  declaredCategory: ContentType;
  inferredCategory: ContentType | "unknown";
  issues: SourceValidationIssue[];
}

export interface CustomSourceInput {
  name: string;
  homepage: string;
  category: ContentType;
  feedUrl?: string;
  discoveryMethodPreference?: SourceDiscoveryMethod | "auto";
}
