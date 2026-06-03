import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeArticle } from "../_fixtures.js";

// Mock the I/O-heavy dependencies so we can exercise the early-return guards of
// translateStoredArticle in isolation (no DB, no AI provider). vi.hoisted lets
// the mock factories reference these spies despite vitest hoisting vi.mock.
const { getStoredArticleById, createAiProvider } = vi.hoisted(() => ({
  getStoredArticleById: vi.fn(),
  createAiProvider: vi.fn()
}));

vi.mock("@techbrief/runtime", () => ({
  getStoredArticleById,
  loadConfig: vi.fn(),
  markArticleProcessing: vi.fn(),
  markArticleTranslationFailed: vi.fn(),
  saveProcessedArticle: vi.fn()
}));

vi.mock("@techbrief/ai", () => ({
  createAiProvider,
  translateArticleWithIntegrityStream: vi.fn()
}));

import { translateStoredArticle } from "../../packages/feed/src/translate-stored-article.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("translateStoredArticle guards", () => {
  it("returns not-found when the article is missing", async () => {
    getStoredArticleById.mockResolvedValue(null);
    const result = await translateStoredArticle({ articleId: "x", targetLanguage: "zh-CN" });
    expect(result).toMatchObject({ ok: false, skipped: false, error: "Article was not found." });
    expect(createAiProvider).not.toHaveBeenCalled();
  });

  it("skips translation for a non-AI target language", async () => {
    getStoredArticleById.mockResolvedValue(makeArticle({ language: "en" }));
    const result = await translateStoredArticle({ articleId: "x", targetLanguage: "en" });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(createAiProvider).not.toHaveBeenCalled();
  });

  it("skips when a translation already exists (loads with the target language)", async () => {
    getStoredArticleById.mockResolvedValue(
      makeArticle({ language: "en", translatedTitle: "标题", translatedBodyRaw: "正文" })
    );
    const result = await translateStoredArticle({ articleId: "x", targetLanguage: "zh-CN" });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(createAiProvider).not.toHaveBeenCalled();
    // Regression guard: the existing-translation check must load with the target
    // language, otherwise hasStoredTranslation can never see the translation.
    expect(getStoredArticleById).toHaveBeenCalledWith("x", "zh-CN");
  });
});
