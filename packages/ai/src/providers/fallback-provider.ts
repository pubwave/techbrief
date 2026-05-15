import { serializeAstToMarkdown } from "@techbrief/converter";
import { getArticlePromptBody } from "@techbrief/shared";
import type { FeedArticle } from "@techbrief/shared";
import type { AiOutput, AiProvider } from "../types.js";

function clampSummary(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeText(input: unknown, fallback: string): string {
  if (typeof input === "string") {
    return input;
  }

  if (input == null) {
    return fallback;
  }

  return String(input);
}

export class FallbackAiProvider implements AiProvider {
  async summarizeAndTranslate(article: FeedArticle, targetLanguage: string): Promise<AiOutput> {
    const sourceSummary = normalizeText(article.summary, normalizeText(article.title, ""));
    const summary = clampSummary(sourceSummary, 180);
    const sourceBody = article.bodyAst
      ? serializeAstToMarkdown(article.bodyAst as Parameters<typeof serializeAstToMarkdown>[0])
      : getArticlePromptBody(article);

    return {
      summary,
      translatedTitle: normalizeText(article.title, ""),
      translatedSummary: summary,
      translatedBodyMarkdown: sourceBody,
      aiMeta: {
        provider: "fallback",
        targetLanguage,
        generatedAt: new Date().toISOString(),
        mode: "fallback"
      }
    };
  }
}
