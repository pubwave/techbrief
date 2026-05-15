import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { logsRoot } from "../../../shared/paths/runtime-paths.js";

export const SYNC_LOG_FILE = path.join(logsRoot(), "sync.log");

export interface SyncLogEntryInput {
  phase: "info" | "source-skipped" | "sync-failed";
  message: string;
  sourceId?: string;
}

export async function appendSyncLogEntry(input: SyncLogEntryInput): Promise<void> {
  const lines = [
    `[${new Date().toISOString()}] phase=${input.phase}`,
    ...(input.sourceId ? [`source=${input.sourceId}`] : []),
    input.message.trim() || "Unknown sync event",
    ""
  ];

  await mkdir(path.dirname(SYNC_LOG_FILE), { recursive: true });
  await appendFile(SYNC_LOG_FILE, `${lines.join("\n")}\n`, "utf8");
}
