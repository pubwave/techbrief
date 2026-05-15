import type { FeedArticle } from "@techbrief/shared";
import type { AiProvider } from "../types.js";
import { translateArticleWithIntegrity } from "./article-translation.js";

export async function processArticleWithAi(
  provider: AiProvider,
  article: FeedArticle,
  targetLanguage: string
): Promise<FeedArticle> {
  const output = await translateArticleWithIntegrity(provider, article, targetLanguage);

  return {
    ...article,
    ...(output.summary ? { summary: output.summary } : {}),
    ...(output.translatedTitle ? { translatedTitle: output.translatedTitle } : {}),
    ...(output.translatedSummary ? { translatedSummary: output.translatedSummary } : {}),
    ...(output.translatedBodyMarkdown ? { translatedBodyRaw: output.translatedBodyMarkdown } : {}),
    aiMeta: output.aiMeta
  };
}
