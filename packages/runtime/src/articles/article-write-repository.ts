import { buildArticleContentHash, requiresAiForLanguage, sanitizeArticleText, type FeedArticle } from "@techbrief/shared";
import { getArticleDatabase } from "./database.js";
import { filterPersistableArticles, hasPersistableArticleBody } from "./persistable-article.js";

export async function upsertFetchedArticles(articles: FeedArticle[], targetLanguage: string): Promise<void> {
  const persistableArticles = filterPersistableArticles(articles);
  if (persistableArticles.length === 0) {
    return;
  }

  const db = getArticleDatabase();
  const upsertRecord = db.prepare(`
    INSERT INTO article_records (
      id, source_id, source_name, content_type, declared_content_type, author,
      published_at, original_url, source_url, cover_image, tags_json, language
    ) VALUES (
      @id, @source_id, @source_name, @content_type, @declared_content_type, @author,
      @published_at, @original_url, @source_url, @cover_image, @tags_json, @language
    )
    ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      source_name = excluded.source_name,
      content_type = excluded.content_type,
      declared_content_type = excluded.declared_content_type,
      author = excluded.author,
      published_at = excluded.published_at,
      original_url = excluded.original_url,
      source_url = excluded.source_url,
      cover_image = excluded.cover_image,
      tags_json = excluded.tags_json,
      language = excluded.language
  `);
  const upsertContent = db.prepare(`
    INSERT INTO article_contents (
      article_id, title, summary, body_raw, body_normalized, body_ast_json, body_tiptap_json, content_hash, updated_at
    ) VALUES (
      @article_id, @title, @summary, @body_raw, @body_normalized, @body_ast_json, @body_tiptap_json, @content_hash, @updated_at
    )
    ON CONFLICT(article_id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_raw = excluded.body_raw,
      body_normalized = excluded.body_normalized,
      body_ast_json = excluded.body_ast_json,
      body_tiptap_json = excluded.body_tiptap_json,
      content_hash = excluded.content_hash,
      updated_at = excluded.updated_at
  `);
  const upsertProcessing = db.prepare(`
    INSERT INTO article_processing_states (
      article_id, target_language, stage, status, error_message, updated_at
    ) VALUES (
      @article_id, @target_language, @stage, @status, NULL, @updated_at
    )
    ON CONFLICT(article_id, target_language) DO UPDATE SET
      stage = excluded.stage,
      status = excluded.status,
      error_message = excluded.error_message,
      updated_at = excluded.updated_at
  `);

  const requiresAi = requiresAiForLanguage(targetLanguage);
  const transaction = db.transaction((nextArticles: FeedArticle[]) => {
    const now = new Date().toISOString();
    for (const article of nextArticles) {
      upsertRecord.run(toArticleRecordParams(article));
      upsertContent.run(toArticleContentParams(article, now));
      upsertProcessing.run({
        article_id: article.id,
        target_language: targetLanguage,
        stage: requiresAi ? "prepared" : "completed",
        status: "completed",
        updated_at: now
      });
    }
  });

  transaction(persistableArticles);
}

export async function markArticleProcessing(articleId: string, targetLanguage: string): Promise<void> {
  const now = new Date().toISOString();
  getArticleDatabase().prepare(`
    INSERT INTO article_processing_states (
      article_id, target_language, stage, status, error_message, updated_at
    ) VALUES (
      ?, ?, 'translating', 'processing', NULL, ?
    )
    ON CONFLICT(article_id, target_language) DO UPDATE SET
      stage = 'translating',
      status = 'processing',
      error_message = NULL,
      updated_at = excluded.updated_at
  `).run(articleId, targetLanguage, now);
}

export async function markArticleTranslationFailed(
  articleId: string,
  targetLanguage: string,
  errorMessage: string
): Promise<void> {
  const now = new Date().toISOString();
  getArticleDatabase().prepare(`
    INSERT INTO article_processing_states (
      article_id, target_language, stage, status, error_message, updated_at
    ) VALUES (
      ?, ?, 'translating', 'failed', ?, ?
    )
    ON CONFLICT(article_id, target_language) DO UPDATE SET
      stage = 'translating',
      status = 'failed',
      error_message = excluded.error_message,
      updated_at = excluded.updated_at
  `).run(articleId, targetLanguage, errorMessage, now);
}

export async function saveProcessedArticle(article: FeedArticle, targetLanguage: string): Promise<boolean> {
  if (!hasPersistableArticleBody(article)) {
    return false;
  }

  const db = getArticleDatabase();
  const updateContent = db.prepare(`
    UPDATE article_contents
    SET summary = @summary,
        body_raw = @body_raw,
        body_normalized = @body_normalized,
        body_ast_json = @body_ast_json,
        body_tiptap_json = @body_tiptap_json,
        content_hash = @content_hash,
        updated_at = @updated_at
    WHERE article_id = @article_id
  `);
  const upsertTranslation = db.prepare(`
    INSERT INTO article_translations (
      article_id, target_language, translated_title, translated_summary, translated_body_raw,
      translated_body_normalized, translated_body_ast_json, translated_body_tiptap_json, ai_meta_json, updated_at
    ) VALUES (
      @article_id, @target_language, @translated_title, @translated_summary, @translated_body_raw,
      @translated_body_normalized, @translated_body_ast_json, @translated_body_tiptap_json, @ai_meta_json, @updated_at
    )
    ON CONFLICT(article_id, target_language) DO UPDATE SET
      translated_title = excluded.translated_title,
      translated_summary = excluded.translated_summary,
      translated_body_raw = excluded.translated_body_raw,
      translated_body_normalized = excluded.translated_body_normalized,
      translated_body_ast_json = excluded.translated_body_ast_json,
      translated_body_tiptap_json = excluded.translated_body_tiptap_json,
      ai_meta_json = excluded.ai_meta_json,
      updated_at = excluded.updated_at
  `);
  const upsertProcessing = db.prepare(`
    INSERT INTO article_processing_states (
      article_id, target_language, stage, status, error_message, updated_at
    ) VALUES (
      @article_id, @target_language, @stage, @status, @error_message, @updated_at
    )
    ON CONFLICT(article_id, target_language) DO UPDATE SET
      stage = excluded.stage,
      status = excluded.status,
      error_message = excluded.error_message,
      updated_at = excluded.updated_at
  `);

  const requiresAi = requiresAiForLanguage(targetLanguage);
  const translated = !requiresAi || hasCompleteTranslationOutput(article, targetLanguage);
  const now = new Date().toISOString();
  const transaction = db.transaction(() => {
    updateContent.run({
      article_id: article.id,
      summary: sanitizeArticleText(article.summary) ?? null,
      body_raw: article.bodyRaw ?? null,
      body_normalized: article.bodyNormalized ?? null,
      body_ast_json: article.bodyAst ? JSON.stringify(article.bodyAst) : null,
      body_tiptap_json: article.bodyTiptapJson ? JSON.stringify(article.bodyTiptapJson) : null,
      content_hash: buildArticleContentHash(article),
      updated_at: now
    });

    if (translated && requiresAi) {
      upsertTranslation.run({
        article_id: article.id,
        target_language: targetLanguage,
        translated_title: sanitizeArticleText(article.translatedTitle) ?? null,
        translated_summary: sanitizeArticleText(article.translatedSummary) ?? null,
        translated_body_raw: article.translatedBodyRaw ?? null,
        translated_body_normalized: article.translatedBodyNormalized ?? null,
        translated_body_ast_json: article.translatedBodyAst ? JSON.stringify(article.translatedBodyAst) : null,
        translated_body_tiptap_json: article.translatedBodyTiptapJson ? JSON.stringify(article.translatedBodyTiptapJson) : null,
        ai_meta_json: article.aiMeta ? JSON.stringify(article.aiMeta) : null,
        updated_at: now
      });
    }

    upsertProcessing.run({
      article_id: article.id,
      target_language: targetLanguage,
      stage: "completed",
      status: translated ? "completed" : "failed",
      error_message: translated ? null : "Missing complete translation body for target language.",
      updated_at: now
    });
  });

  transaction();
  return translated;
}

function hasCompleteTranslationOutput(article: FeedArticle, targetLanguage: string): boolean {
  if (article.aiMeta?.targetLanguage !== targetLanguage) {
    return false;
  }

  return Boolean(article.translatedBodyRaw?.trim());
}

function toArticleRecordParams(article: FeedArticle): Record<string, string | null> {
  return {
    id: article.id,
    source_id: article.sourceId,
    source_name: article.sourceName,
    content_type: article.contentType,
    declared_content_type: article.declaredContentType,
    author: sanitizeArticleText(article.author) ?? null,
    published_at: article.publishedAt,
    original_url: article.originalUrl,
    source_url: article.sourceUrl ?? null,
    cover_image: article.coverImage ?? null,
    tags_json: JSON.stringify(article.tags),
    language: article.language
  };
}

function toArticleContentParams(article: FeedArticle, updatedAt: string): Record<string, string | null> {
  return {
    article_id: article.id,
    title: sanitizeArticleText(article.title) ?? article.title,
    summary: sanitizeArticleText(article.summary) ?? null,
    body_raw: article.bodyRaw ?? null,
    body_normalized: article.bodyNormalized ?? null,
    body_ast_json: article.bodyAst ? JSON.stringify(article.bodyAst) : null,
    body_tiptap_json: article.bodyTiptapJson ? JSON.stringify(article.bodyTiptapJson) : null,
    content_hash: buildArticleContentHash(article),
    updated_at: updatedAt
  };
}
