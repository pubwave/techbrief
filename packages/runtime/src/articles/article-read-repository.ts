import type { FeedArticle } from "@techbrief/shared";
import { getArticleDatabase } from "./database.js";
import { mapStoredArticleRow } from "./mapping.js";
import type {
  ArticleProcessingSnapshot,
  StoredArticlePage,
  StoredArticleQuery,
  StoredArticleRow
} from "./types.js";

export async function loadArticlesForReuse(targetLanguage: string): Promise<FeedArticle[]> {
  const rows = queryStoredArticleRows({
    preferredLanguage: targetLanguage,
    limit: null,
    offset: 0
  });
  return rows.map((row) => mapStoredArticleRow(row, targetLanguage));
}

export async function listStoredArticles(input: StoredArticleQuery): Promise<StoredArticlePage> {
  const rows = queryStoredArticleRows({
    ...input,
    limit: input.limit ?? 50,
    offset: input.offset ?? 0
  });
  const total = countStoredArticleRows(input);
  return {
    items: rows.map((row) => mapStoredArticleRow(row, input.preferredLanguage)),
    total
  };
}

export async function getStoredArticleById(articleId: string, preferredLanguage?: string | null): Promise<FeedArticle | null> {
  const db = getArticleDatabase();
  const joins = buildStoredArticleTranslationJoins(preferredLanguage);
  const row = db.prepare(`
    SELECT ${selectStoredArticleColumns()}
    FROM article_records ar
    INNER JOIN article_contents ac ON ac.article_id = ar.id
    ${joins.translationJoin}
    ${joins.processingJoin}
    WHERE ar.id = ?
    LIMIT 1
  `).get(...joins.params, articleId) as StoredArticleRow | undefined;

  return row ? mapStoredArticleRow(row, preferredLanguage) : null;
}

export async function countStoredArticles(): Promise<number> {
  const row = getArticleDatabase()
    .prepare("SELECT COUNT(*) AS total FROM article_records")
    .get() as { total: number };
  return row.total;
}

export async function loadArticleProcessingSnapshot(targetLanguage: string): Promise<ArticleProcessingSnapshot> {
  const db = getArticleDatabase();
  const counts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status IN ('completed', 'failed') THEN 1 ELSE 0 END) AS processed,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS saved
    FROM article_processing_states
    WHERE target_language = ?
  `).get(targetLanguage) as {
    total: number;
    processed: number | null;
    saved: number | null;
  };

  const processingArticles = db.prepare(`
    SELECT
      ar.id,
      ar.source_id,
      ar.source_name,
      ar.content_type,
      ar.declared_content_type,
      ac.title,
      ar.published_at,
      ar.original_url,
      ar.tags_json,
      ar.language
    FROM article_processing_states aps
    INNER JOIN article_records ar ON ar.id = aps.article_id
    INNER JOIN article_contents ac ON ac.article_id = ar.id
    WHERE aps.target_language = ?
      AND aps.status = 'processing'
    ORDER BY aps.updated_at DESC
    LIMIT 5
  `).all(targetLanguage) as Array<{
    id: string;
    source_id: string;
    source_name: string;
    content_type: FeedArticle["contentType"];
    declared_content_type: FeedArticle["declaredContentType"];
    title: string;
    published_at: string;
    original_url: string;
    tags_json: string;
    language: string;
  }>;

  return {
    total: counts.total,
    processed: counts.processed ?? 0,
    saved: counts.saved ?? 0,
    processingArticles: processingArticles.map((article) => ({
      id: article.id,
      sourceId: article.source_id,
      sourceName: article.source_name,
      contentType: article.content_type,
      declaredContentType: article.declared_content_type,
      title: article.title,
      publishedAt: article.published_at,
      originalUrl: article.original_url,
      tags: JSON.parse(article.tags_json) as string[],
      language: article.language
    }))
  };
}

export async function loadPendingArticlesForProcessing(targetLanguage: string): Promise<FeedArticle[]> {
  const rows = getArticleDatabase().prepare(`
    SELECT ${selectStoredArticleColumns()}
    FROM article_records ar
    INNER JOIN article_contents ac ON ac.article_id = ar.id
    INNER JOIN article_processing_states aps
      ON aps.article_id = ar.id
      AND aps.target_language = ?
      AND aps.status IN ('pending', 'processing')
    LEFT JOIN article_translations at
      ON at.article_id = ar.id
      AND at.target_language = ?
    ORDER BY ar.published_at DESC
  `).all(targetLanguage, targetLanguage) as StoredArticleRow[];

  return rows.map((row) => mapStoredArticleRow(row, targetLanguage));
}

function queryStoredArticleRows(input: StoredArticleQuery): StoredArticleRow[] {
  const db = getArticleDatabase();
  const { clause, params } = buildStoredArticleWhereClause(input);
  const joins = buildStoredArticleTranslationJoins(input.preferredLanguage);
  const offset = input.offset ?? 0;
  const sql = `
    SELECT ${selectStoredArticleColumns()}
    FROM article_records ar
    INNER JOIN article_contents ac ON ac.article_id = ar.id
    ${joins.translationJoin}
    ${joins.processingJoin}
    ${clause}
    ORDER BY ar.published_at DESC
    ${typeof input.limit === "number" ? "LIMIT ? OFFSET ?" : ""}
  `;
  return db.prepare(sql).all(
    ...joins.params,
    ...params,
    ...(typeof input.limit === "number" ? [input.limit, offset] : [])
  ) as StoredArticleRow[];
}

function countStoredArticleRows(input: StoredArticleQuery): number {
  const db = getArticleDatabase();
  const { clause, params } = buildStoredArticleWhereClause(input);
  const joins = buildStoredArticleTranslationJoins(input.preferredLanguage);
  const row = db.prepare(`
    SELECT COUNT(*) AS total
    FROM article_records ar
    INNER JOIN article_contents ac ON ac.article_id = ar.id
    ${joins.translationJoin}
    ${joins.processingJoin}
    ${clause}
  `).get(...joins.params, ...params) as { total: number };
  return row.total;
}

function buildStoredArticleTranslationJoins(preferredLanguage?: string | null): {
  translationJoin: string;
  processingJoin: string;
  params: unknown[];
} {
  return {
    translationJoin: `
      LEFT JOIN article_translations at
        ON at.article_id = ar.id
        AND at.target_language = ?
    `,
    processingJoin: "",
    params: [preferredLanguage ?? null]
  };
}

function buildStoredArticleWhereClause(input: StoredArticleQuery): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (input.category) {
    conditions.push("ar.content_type = ?");
    params.push(input.category);
  }

  if (input.sourceId) {
    conditions.push("ar.source_id = ?");
    params.push(input.sourceId);
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params
  };
}

function selectStoredArticleColumns(): string {
  return `
    ar.id,
    ar.source_id,
    ar.source_name,
    ar.content_type,
    ar.declared_content_type,
    ar.author,
    ar.published_at,
    ar.original_url,
    ar.cover_image,
    ar.tags_json,
    ar.language,
    ac.article_id,
    ac.title,
    ac.summary,
    ac.body_raw,
    ac.body_normalized,
    ac.body_ast_json,
    ac.body_tiptap_json,
    ac.content_hash,
    at.translated_title,
    at.translated_summary,
    at.translated_body_raw,
    at.translated_body_normalized,
    at.translated_body_ast_json,
    at.translated_body_tiptap_json,
    at.ai_meta_json
  `;
}
