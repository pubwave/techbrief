import { requiresAiForLanguage, sanitizeArticleText, type FeedArticle } from "@techbrief/shared";
import type { StoredArticleRow } from "./types.js";

export function mapStoredArticleRow(row: StoredArticleRow, preferredLanguage?: string | null): FeedArticle {
  const title = sanitizeArticleText(row.title) ?? row.title;
  const summary = sanitizeArticleText(row.summary);
  const author = sanitizeArticleText(row.author);
  const translatedTitle = sanitizeArticleText(row.translated_title);
  const translatedSummary = sanitizeArticleText(row.translated_summary);
  const translationAiMeta = parseJsonRecord(row.ai_meta_json);
  const aiMeta =
    translationAiMeta || row.content_hash || canReuseWithoutTranslation(row, preferredLanguage)
      ? {
          ...(translationAiMeta ?? {}),
          ...(canReuseWithoutTranslation(row, preferredLanguage)
            ? {
                targetLanguage: preferredLanguage,
                requiresAi: false
              }
            : {}),
          ...(row.content_hash ? { contentHash: row.content_hash } : {})
        }
      : undefined;

  const base: FeedArticle = {
    id: row.id,
    sourceId: row.source_id,
    sourceName: row.source_name,
    contentType: row.content_type,
    declaredContentType: row.declared_content_type,
    title,
    ...(summary ? { summary } : {}),
    ...(author ? { author } : {}),
    publishedAt: row.published_at,
    originalUrl: row.original_url,
    ...(row.cover_image ? { coverImage: row.cover_image } : {}),
    tags: JSON.parse(row.tags_json) as string[],
    language: row.language,
    ...(row.body_raw ? { bodyRaw: row.body_raw } : {}),
    ...(row.body_normalized ? { bodyNormalized: row.body_normalized } : {}),
    ...(row.body_ast_json ? { bodyAst: JSON.parse(row.body_ast_json) } : {}),
    ...(row.body_tiptap_json ? { bodyTiptapJson: JSON.parse(row.body_tiptap_json) } : {}),
    ...(translatedTitle ? { translatedTitle } : {}),
    ...(translatedSummary ? { translatedSummary } : {}),
    ...(row.translated_body_raw ? { translatedBodyRaw: row.translated_body_raw } : {}),
    ...(row.translated_body_normalized ? { translatedBodyNormalized: row.translated_body_normalized } : {}),
    ...(row.translated_body_ast_json ? { translatedBodyAst: JSON.parse(row.translated_body_ast_json) } : {}),
    ...(row.translated_body_tiptap_json
      ? { translatedBodyTiptapJson: JSON.parse(row.translated_body_tiptap_json) }
      : {}),
    ...(aiMeta ? { aiMeta } : {})
  };

  if (!preferredLanguage || preferredLanguage === row.language || !row.translated_title && !row.translated_summary && !row.translated_body_raw) {
    return base;
  }

  return {
    ...base,
    title: translatedTitle ?? base.title,
    ...(translatedSummary ?? base.summary
      ? { summary: translatedSummary ?? base.summary }
      : {}),
    ...(row.translated_body_raw ?? base.bodyRaw
      ? { bodyRaw: row.translated_body_raw ?? base.bodyRaw }
      : {}),
    ...(row.translated_body_normalized ?? base.bodyNormalized
      ? { bodyNormalized: row.translated_body_normalized ?? base.bodyNormalized }
      : {}),
    ...(row.translated_body_ast_json ?? base.bodyAst
      ? { bodyAst: row.translated_body_ast_json ? JSON.parse(row.translated_body_ast_json) : base.bodyAst }
      : {}),
    ...(row.translated_body_tiptap_json ?? base.bodyTiptapJson
      ? {
          bodyTiptapJson: row.translated_body_tiptap_json
            ? JSON.parse(row.translated_body_tiptap_json)
            : base.bodyTiptapJson
        }
      : {})
  };
}

function canReuseWithoutTranslation(row: StoredArticleRow, preferredLanguage?: string | null): boolean {
  return Boolean(preferredLanguage && preferredLanguage === row.language && !requiresAiForLanguage(preferredLanguage));
}

function parseJsonRecord(value: string | null): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  return JSON.parse(value) as Record<string, unknown>;
}
