import type { AiConfig } from "@techbrief/shared";
import type { FeedArticle } from "@techbrief/shared";

export interface AiOutput {
  summary?: string;
  translatedTitle?: string;
  translatedSummary?: string;
  translatedBodyMarkdown?: string;
  aiMeta: Record<string, unknown>;
}

export interface AiProvider {
  summarizeAndTranslate(article: FeedArticle, targetLanguage: string): Promise<AiOutput>;
  translateBodyChunk?(input: {
    article: FeedArticle;
    body: string;
    targetLanguage: string;
    onDelta?: (delta: string) => void;
  }): Promise<string>;
}

export interface ProviderAvailability {
  provider: string;
  available: boolean;
  detail: string;
  configured?: boolean;
  status?: "ready" | "missing-config" | "runtime-unavailable" | "model-missing" | "unreachable" | "auth-failed";
  capabilities?: {
    structuredOutput: boolean;
    localRuntime: boolean;
    markdownTranslation: boolean;
    jsonMode: boolean;
    modelListing: boolean;
  };
}

export interface HttpProviderOptions {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export type AiRuntimeConfig = AiConfig;
