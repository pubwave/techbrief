import { serializeAstToMarkdown } from "@techbrief/converter";
import { getArticlePromptBody } from "@techbrief/shared";
import type { FeedArticle } from "@techbrief/shared";

export function buildArticlePrompt(article: FeedArticle, targetLanguage: string): string {
  const sourceBody = article.bodyAst
    ? serializeAstToMarkdown(article.bodyAst as Parameters<typeof serializeAstToMarkdown>[0])
    : getArticlePromptBody(article);

  return [
    "You process imported technology articles for a multilingual reading product.",
    "Return valid JSON only. No markdown fences, no commentary.",
    "Schema:",
    '{"summary":"string","translatedTitle":"string","translatedSummary":"string","translatedBodyMarkdown":"string"}',
    "Field rules:",
    "- summary: 1–3 sentences in the source language, factual and editorial-free.",
    `- translatedTitle, translatedSummary, translatedBodyMarkdown: written in ${targetLanguage}.`,
    "- translatedBodyMarkdown must mirror the source markdown structure (headings, bullet/ordered lists, blockquotes, fenced code, inline code, images, tables, links).",
    "- Do not invent, merge, or remove sections.",
    "Translation style:",
    "- Translate naturally in the target language, not word-for-word.",
    "- Preserve code, identifiers, file paths, CLI flags, URLs, and fenced code blocks exactly as-is.",
    "- Keep widely-used technical acronyms (HTTP, JSON, SDK, API, CLI, etc.) and product/brand names in their original form.",
    "- Use the target language's standard punctuation and spacing conventions (full-width punctuation for Chinese/Japanese).",
    "- If a passage is already in the target language, keep it as-is.",
    "",
    `Title: ${article.title}`,
    `Source: ${article.sourceName}`,
    `Source language: ${article.language}`,
    `Content type: ${article.contentType}`,
    `Article markdown:\n${sourceBody}`
  ].join("\n");
}

export function buildBodyTranslationPrompt(input: {
  article: FeedArticle;
  body: string;
  targetLanguage: string;
}): string {
  return [
    "You translate technology article bodies for a multilingual reading product.",
    `Output clean markdown in ${input.targetLanguage} only. No preamble, no trailing commentary, no markdown fences wrapping the response.`,
    "Structure rules:",
    "- Mirror the source markdown exactly: headings, bullet/ordered lists, blockquotes, tables, fenced code, inline code, images, links.",
    "- Do not add a title, summary, author line, or any section not present in the source.",
    "- Do not merge or reorder paragraphs.",
    "Translation style:",
    "- Translate naturally in the target language; avoid literal word-for-word output.",
    "- Keep code, identifiers, file paths, CLI flags, URLs, and fenced code blocks byte-identical to the source.",
    "- Keep widely-used technical acronyms (HTTP, JSON, SDK, API, CLI, etc.) and product/brand names in their original form.",
    "- Use the target language's standard punctuation (full-width punctuation for Chinese/Japanese).",
    "- If a passage is already in the target language, preserve it verbatim.",
    "",
    `Title: ${input.article.title}`,
    `Source: ${input.article.sourceName}`,
    `Source language: ${input.article.language}`,
    `Content type: ${input.article.contentType}`,
    `Body markdown:\n${input.body}`
  ].join("\n");
}

export function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate) as Record<string, unknown>;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}
