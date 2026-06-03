import type { FeedArticle } from "@techbrief/shared";
import { loadConfig } from "../store/config-store.js";
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
  // Per-source ranking priority comes from config (defaults seeded from the
  // source definitions). Read it here so the feed sort reflects priority changes
  // live, without the server/feed callers needing to know about it.
  const config = await loadConfig();
  const sourcePriorities: Record<string, number> = {};
  for (const [id, item] of Object.entries(config.sources.items)) {
    if (typeof item.priority === "number") {
      sourcePriorities[id] = item.priority;
    }
  }
  const rows = queryStoredArticleRows({
    ...input,
    limit: input.limit ?? 50,
    offset: input.offset ?? 0
  }, sourcePriorities);
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

export async function getMaxArticlePublishedAt(): Promise<string | null> {
  const row = getArticleDatabase()
    .prepare("SELECT MAX(published_at) AS max_at FROM article_records")
    .get() as { max_at: string | null };
  return row.max_at;
}

// A monotonic-ish revision of the article table used to detect newly ingested
// rows. Articles are upserted by id, so a new article bumps both COUNT and
// MAX(rowid), while in-place content updates change neither. This is robust to
// out-of-order publishedAt (unlike MAX(published_at)), so it never misses a new
// article whose publish time is older than the current newest one.
export async function getArticleFeedRevision(): Promise<string> {
  const row = getArticleDatabase()
    .prepare("SELECT COUNT(*) AS count, COALESCE(MAX(rowid), 0) AS max_row_id FROM article_records")
    .get() as { count: number; max_row_id: number };
  return `${row.count}:${row.max_row_id}`;
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
    source_url: string | null;
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
      ...(article.source_url ? { sourceUrl: article.source_url } : {}),
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

function queryStoredArticleRows(
  input: StoredArticleQuery,
  sourcePriorities?: Record<string, number>
): StoredArticleRow[] {
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
    ${buildStoredArticleOrderByClause(sourcePriorities)}
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
  const { clause, params } = buildStoredArticleWhereClause(input, { includeSince: false });
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

function buildStoredArticleWhereClause(input: StoredArticleQuery, { includeSince = true } = {}): { clause: string; params: unknown[] } {
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

  if (includeSince && input.since) {
    conditions.push("ar.published_at > ?");
    params.push(input.since);
  }

  const search = input.search?.trim();
  if (search) {
    // Global search across the whole DB (title/summary/source/tags), not just
    // the loaded page. Parameterized → injection-safe.
    const term = `%${search.toLowerCase()}%`;
    conditions.push(`(
      lower(ac.title) LIKE ?
      OR lower(coalesce(ac.summary, '')) LIKE ?
      OR lower(ar.source_name) LIKE ?
      OR lower(ar.tags_json) LIKE ?
      OR lower(coalesce(at.translated_title, '')) LIKE ?
      OR lower(coalesce(at.translated_summary, '')) LIKE ?
    )`);
    params.push(term, term, term, term, term, term);
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
    ar.source_url,
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

// Feed ranking weights. Each score component below is normalized to ~0..1, then
// multiplied by its weight here. The weights equal each component's previous raw
// range, so the composite score (and ordering) is identical to the pre-weight
// version; they exist so the relative pull of each dimension is tunable in one
// place. Raise WEIGHT_SOURCE to make per-source `priority` matter more vs
// recency; lower WEIGHT_FRESHNESS to stop fresh items burying authoritative ones.
const WEIGHT_FRESHNESS = 100;
const WEIGHT_SOURCE = 30;
const WEIGHT_TOPIC = 21;
const WEIGHT_CONTENT = 7;

// Per-source priority is divided by this reference (the top default tier) to
// land in ~0..1 before WEIGHT_SOURCE is applied. WEIGHT_SOURCE === reference
// makes the weighted term reproduce the raw priority exactly.
const SOURCE_PRIORITY_REFERENCE = 30;

function buildStoredArticleOrderByClause(sourcePriorities?: Record<string, number>): string {
  return `
    ORDER BY (
      (${WEIGHT_FRESHNESS.toFixed(1)} * (${freshnessScoreExpression()}))
      + (${WEIGHT_SOURCE.toFixed(1)} * (${sourceScoreExpression(sourcePriorities)}))
      + (${WEIGHT_TOPIC.toFixed(1)} * (${topicScoreExpression()}))
      + (${WEIGHT_CONTENT.toFixed(1)} * (${contentCompletenessScoreExpression()}))
    ) DESC,
    ar.published_at DESC,
    ar.id ASC
  `;
}

// Normalized 0..1: 1.0 at publish time, decaying linearly to 0.0 at 72h old,
// then flat 0. Scaled by WEIGHT_FRESHNESS in the ORDER BY clause.
function freshnessScoreExpression(): string {
  return `
    min(
      72.0,
      max(0.0, 72.0 - ((julianday('now') - julianday(ar.published_at)) * 24.0))
    ) / 72.0
  `;
}

// Source ranking score, driven by the per-source `priority` from config rather
// than a hardcoded list. Normalized to ~0..1 by dividing by
// SOURCE_PRIORITY_REFERENCE, then scaled by WEIGHT_SOURCE in the ORDER BY clause.
// The CASE is generated from the priority map; source ids are whitelist-validated
// and priorities coerced to numbers, so the inlined SQL is injection-safe. No
// priorities (or all zero) → no source boost.
function sourceScoreExpression(sourcePriorities?: Record<string, number>): string {
  if (!sourcePriorities) {
    return "0.0";
  }
  const validSourceId = /^[A-Za-z0-9._:-]+$/;
  const cases = Object.entries(sourcePriorities)
    .filter(([id, priority]) => validSourceId.test(id) && Number.isFinite(priority) && priority !== 0)
    .map(([id, priority]) => `WHEN ar.source_id = '${id}' THEN ${Number(priority).toFixed(1)}`);
  if (cases.length === 0) {
    return "0.0";
  }
  // Raw priority divided by the reference in SQL (not JS) so the weighted term
  // reproduces the original priority exactly when WEIGHT_SOURCE === reference.
  return `(CASE ${cases.join(" ")} ELSE 0.0 END) / ${SOURCE_PRIORITY_REFERENCE.toFixed(1)}`;
}

function topicScoreExpression(): string {
  const searchableText = `
    lower(
      ar.tags_json
      || ' '
      || ac.title
      || ' '
      || coalesce(ac.summary, '')
    )
  `;
  const titleText = "lower(ac.title)";
  const tagText = "lower(ar.tags_json)";
  // Raw keyword points (max 5+4+4+3+3+2 = 21) normalized to ~0..1, then scaled
  // by WEIGHT_TOPIC in the ORDER BY clause.
  return `
    (
      (CASE WHEN ${tagText} GLOB '*"ai"*'
        OR ${titleText} GLOB '* ai *'
        OR ${titleText} GLOB 'ai *'
        OR ${titleText} GLOB '* ai-*'
        OR ${titleText} GLOB '* ai:*'
        OR ${titleText} GLOB '*openai*'
        THEN 5.0 ELSE 0.0 END)
      + (CASE WHEN ${searchableText} GLOB '*agent*' THEN 4.0 ELSE 0.0 END)
      + (CASE WHEN ${searchableText} GLOB '*launch*' THEN 4.0 ELSE 0.0 END)
      + (CASE WHEN ${searchableText} GLOB '*developer*' THEN 3.0 ELSE 0.0 END)
      + (CASE WHEN ${searchableText} GLOB '*engineering*' THEN 3.0 ELSE 0.0 END)
      + (CASE WHEN ${searchableText} GLOB '*startup*' THEN 2.0 ELSE 0.0 END)
    ) / 21.0
  `;
}

// Raw completeness points (max 3+3+1 = 7) normalized to ~0..1, then scaled by
// WEIGHT_CONTENT in the ORDER BY clause.
function contentCompletenessScoreExpression(): string {
  return `
    (
      (CASE WHEN ac.summary IS NOT NULL AND length(trim(ac.summary)) > 0 THEN 3.0 ELSE 0.0 END)
      + (CASE WHEN ac.body_normalized IS NOT NULL AND length(trim(ac.body_normalized)) > 800 THEN 3.0 ELSE 0.0 END)
      + (CASE WHEN ar.author IS NOT NULL AND length(trim(ar.author)) > 0 THEN 1.0 ELSE 0.0 END)
    ) / 7.0
  `;
}
