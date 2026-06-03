import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  countStoredArticles,
  getStoredArticleById,
  listStoredArticles,
  saveProcessedArticle,
  upsertFetchedArticles
} from "@techbrief/runtime";
import { makeArticle } from "../_fixtures.js";

// Point the runtime at a throwaway app-home so it builds an isolated sqlite db.
// The db is opened lazily on the first repository call (in beforeAll), and
// resolveAppHome reads this env var at that call time — so setting it here at
// module top, before any test runs, is sufficient.
const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "techbrief-test-"));
process.env.TECHBRIEF_HOME = tempHome;

afterAll(() => {
  fs.rmSync(tempHome, { recursive: true, force: true });
});

const articleOne = makeArticle({ id: "a1", originalUrl: "https://example.com/a1", title: "First article", bodyRaw: "body one" });
const articleTwo = makeArticle({ id: "a2", originalUrl: "https://example.com/a2", title: "Second article", bodyRaw: "body two" });

beforeAll(async () => {
  await upsertFetchedArticles([articleOne, articleTwo], "en");
});

describe("article repository (sqlite round-trip)", () => {
  it("persists upserted articles", async () => {
    expect(await countStoredArticles()).toBe(2);
  });

  it("reads a stored article back by id", async () => {
    const stored = await getStoredArticleById("a1");
    expect(stored?.title).toBe("First article");
    expect(stored?.bodyRaw).toBe("body one");
  });

  it("lists stored articles with a total", async () => {
    const page = await listStoredArticles({ limit: 10, offset: 0 });
    expect(page.total).toBe(2);
    expect(page.items).toHaveLength(2);
  });

  it("stores and reads back a translation for the target language", async () => {
    const saved = await saveProcessedArticle(
      makeArticle({
        id: "a1",
        originalUrl: "https://example.com/a1",
        title: "First article",
        bodyRaw: "body one",
        translatedTitle: "第一篇文章",
        translatedBodyRaw: "正文一",
        translatedBodyNormalized: "正文一",
        aiMeta: { targetLanguage: "zh-CN" }
      }),
      "zh-CN"
    );
    expect(saved).toBe(true);

    const zh = await getStoredArticleById("a1", "zh-CN");
    expect(zh?.translatedTitle).toBe("第一篇文章");
  });

  it("does not surface a translation when loaded with a null language (join on NULL never matches)", async () => {
    const base = await getStoredArticleById("a1", null);
    expect(base?.translatedTitle).toBeUndefined();
  });
});
