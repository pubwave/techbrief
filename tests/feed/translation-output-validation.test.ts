import { describe, expect, it } from "vitest";
import type { FeedArticle } from "@techbrief/shared";
import { validateTranslationOutputLanguage } from "../../packages/feed/src/translation-output-validation.js";

const sourceArticle = {
  title: "A practical guide to caching strategies"
} as FeedArticle;

describe("validateTranslationOutputLanguage", () => {
  it("passes any output when the target language has no script check (e.g. en/fr)", () => {
    const result = validateTranslationOutputLanguage({
      sourceArticle,
      targetLanguage: "en",
      translatedTitle: "anything",
      translatedBodyMarkdown: "still latin"
    });
    expect(result.valid).toBe(true);
  });

  it("accepts properly translated Chinese output", () => {
    const result = validateTranslationOutputLanguage({
      sourceArticle,
      targetLanguage: "zh-CN",
      translatedTitle: "缓存策略实用指南",
      translatedSummary: "本文介绍常见的缓存策略与取舍。",
      translatedBodyMarkdown: "缓存可以显著降低延迟，但也带来一致性问题，需要权衡使用。"
    });
    expect(result.valid).toBe(true);
  });

  it("rejects untranslated Latin prose claiming to be Chinese", () => {
    const result = validateTranslationOutputLanguage({
      sourceArticle,
      targetLanguage: "zh-CN",
      translatedTitle: "A practical guide to caching strategies",
      translatedSummary: "This article explains common caching strategies and trade-offs.",
      translatedBodyMarkdown:
        "Caching can significantly reduce latency but introduces consistency problems that you must weigh carefully before adopting it."
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("zh-CN");
  });

  it("does not judge code-heavy / very short bodies (too little prose)", () => {
    const result = validateTranslationOutputLanguage({
      sourceArticle: { title: "x" } as FeedArticle,
      targetLanguage: "zh-CN",
      translatedTitle: "x",
      translatedBodyMarkdown: "```\nconst x = 1;\n```"
    });
    expect(result.valid).toBe(true);
  });
});
