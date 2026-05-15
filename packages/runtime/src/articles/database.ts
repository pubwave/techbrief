import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { getAppStateDir } from "../fs/paths.js";
import { initializeArticleSchema } from "./schema.js";

let database: Database.Database | null = null;

export function getArticleDatabase(): Database.Database {
  if (database) {
    return database;
  }

  const appStateDir = getAppStateDir();
  fs.mkdirSync(appStateDir, { recursive: true });
  database = new Database(path.join(appStateDir, "techbrief.db"));
  database.pragma("foreign_keys = ON");
  initializeArticleSchema(database);
  return database;
}
