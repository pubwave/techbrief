import { randomUUID } from "node:crypto";
import { getArticleDatabase } from "./database.js";

export async function beginSyncRun(targetLanguage: string): Promise<string> {
  const runId = randomUUID();
  getArticleDatabase().prepare(`
    INSERT INTO sync_runs (id, target_language, status, started_at, completed_at, failure_message)
    VALUES (?, ?, 'in_progress', ?, NULL, NULL)
  `).run(runId, targetLanguage, new Date().toISOString());
  return runId;
}

export async function completeSyncRun(runId: string): Promise<void> {
  getArticleDatabase().prepare(`
    UPDATE sync_runs
    SET status = 'completed',
        completed_at = ?,
        failure_message = NULL
    WHERE id = ?
  `).run(new Date().toISOString(), runId);
}

export async function failSyncRun(runId: string, failureMessage: string): Promise<void> {
  getArticleDatabase().prepare(`
    UPDATE sync_runs
    SET status = 'failed',
        completed_at = ?,
        failure_message = ?
    WHERE id = ?
  `).run(new Date().toISOString(), failureMessage, runId);
}

export async function recordSyncSourceResult(input: {
  runId: string;
  sourceId: string;
  status: "fetched" | "skipped";
  articleCount?: number;
  message?: string;
}): Promise<void> {
  getArticleDatabase().prepare(`
    INSERT INTO sync_run_sources (sync_run_id, source_id, status, article_count, message)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(sync_run_id, source_id) DO UPDATE SET
      status = excluded.status,
      article_count = excluded.article_count,
      message = excluded.message
  `).run(input.runId, input.sourceId, input.status, input.articleCount ?? 0, input.message ?? null);
}
