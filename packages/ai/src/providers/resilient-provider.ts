import type { FeedArticle } from "@techbrief/shared";
import type { AiOutput, AiProvider } from "../types.js";

export class ResilientAiProvider implements AiProvider {
  constructor(
    private readonly primary: AiProvider,
    private readonly fallback: AiProvider,
    private readonly providerName: string
  ) {}

  async summarizeAndTranslate(article: FeedArticle, targetLanguage: string): Promise<AiOutput> {
    try {
      return await this.primary.summarizeAndTranslate(article, targetLanguage);
    } catch (error) {
      const fallback = await this.fallback.summarizeAndTranslate(article, targetLanguage);

      return {
        ...fallback,
        aiMeta: {
          ...fallback.aiMeta,
          provider: this.providerName,
          fallbackProvider: "local",
          error: error instanceof Error ? error.message : "Unknown provider error"
        }
      };
    }
  }

  async translateBodyChunk(input: {
    article: FeedArticle;
    body: string;
    targetLanguage: string;
    onDelta?: (delta: string) => void;
  }): Promise<string> {
    if (this.primary.translateBodyChunk) {
      try {
        return await this.primary.translateBodyChunk(input);
      } catch {
        // Fall through to summarize-based fallback below.
      }
    }

    if (this.fallback.translateBodyChunk) {
      return this.fallback.translateBodyChunk(input);
    }

    const fallback = await this.fallback.summarizeAndTranslate({
      ...input.article,
      bodyRaw: input.body,
      bodyNormalized: input.body
    }, input.targetLanguage);

    return fallback.translatedBodyMarkdown ?? input.body;
  }
}
