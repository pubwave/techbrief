import type { AiOutput } from "../types.js";
import { asString } from "./prompt.js";

export function createArticleAiOutput(input: {
  summary: string | undefined;
  translatedTitle: string | undefined;
  translatedSummary: string | undefined;
  translatedBodyMarkdown: string | undefined;
  aiMeta: Record<string, unknown>;
}): AiOutput {
  return {
    ...(input.summary ? { summary: input.summary } : {}),
    ...(input.translatedTitle ? { translatedTitle: input.translatedTitle } : {}),
    ...(input.translatedSummary ? { translatedSummary: input.translatedSummary } : {}),
    ...(input.translatedBodyMarkdown ? { translatedBodyMarkdown: input.translatedBodyMarkdown } : {}),
    aiMeta: input.aiMeta
  };
}

export function createParsedArticleAiOutput(input: {
  parsed: Record<string, unknown>;
  provider: string;
  model: string;
  targetLanguage: string;
}): AiOutput {
  return createArticleAiOutput({
    summary: asString(input.parsed.summary),
    translatedTitle: asString(input.parsed.translatedTitle),
    translatedSummary: asString(input.parsed.translatedSummary),
    translatedBodyMarkdown: asString(input.parsed.translatedBodyMarkdown),
    aiMeta: {
      provider: input.provider,
      model: input.model,
      targetLanguage: input.targetLanguage,
      generatedAt: new Date().toISOString()
    }
  });
}
