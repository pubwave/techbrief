import Database from "better-sqlite3";

export function initializeArticleSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS article_records (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      declared_content_type TEXT NOT NULL,
      author TEXT,
      published_at TEXT NOT NULL,
      original_url TEXT NOT NULL,
      cover_image TEXT,
      tags_json TEXT NOT NULL,
      language TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS article_records_source_url_idx
    ON article_records (source_id, original_url);

    CREATE INDEX IF NOT EXISTS article_records_published_at_idx
    ON article_records (published_at DESC);

    CREATE INDEX IF NOT EXISTS article_records_source_id_idx
    ON article_records (source_id);

    CREATE TABLE IF NOT EXISTS article_contents (
      article_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      body_raw TEXT,
      body_normalized TEXT,
      body_ast_json TEXT,
      body_tiptap_json TEXT,
      content_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(article_id) REFERENCES article_records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS article_contents_content_hash_idx
    ON article_contents (content_hash);

    CREATE TABLE IF NOT EXISTS article_translations (
      article_id TEXT NOT NULL,
      target_language TEXT NOT NULL,
      translated_title TEXT,
      translated_summary TEXT,
      translated_body_raw TEXT,
      translated_body_normalized TEXT,
      translated_body_ast_json TEXT,
      translated_body_tiptap_json TEXT,
      ai_meta_json TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (article_id, target_language),
      FOREIGN KEY(article_id) REFERENCES article_records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS article_translations_target_language_idx
    ON article_translations (target_language);

    CREATE TABLE IF NOT EXISTS article_processing_states (
      article_id TEXT NOT NULL,
      target_language TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (article_id, target_language),
      FOREIGN KEY(article_id) REFERENCES article_records(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS article_processing_states_status_idx
    ON article_processing_states (target_language, status);

    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY,
      target_language TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      failure_message TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_run_sources (
      sync_run_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      status TEXT NOT NULL,
      article_count INTEGER NOT NULL DEFAULT 0,
      message TEXT,
      PRIMARY KEY (sync_run_id, source_id),
      FOREIGN KEY(sync_run_id) REFERENCES sync_runs(id) ON DELETE CASCADE
    );
  `);

  ensureColumn(db, "article_records", "source_url", "TEXT");
}

function ensureColumn(db: Database.Database, tableName: string, columnName: string, definition: string): void {
  const columns = db.pragma(`table_info(${tableName})`) as Array<{ name: string }>;
  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}
