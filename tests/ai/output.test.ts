import { describe, expect, it } from "vitest";
import { createParsedArticleAiOutput } from "../../packages/ai/src/providers/output.js";

describe("createParsedArticleAiOutput", () => {
  it("maps parsed fields and attaches ai metadata", () => {
    const output = createParsedArticleAiOutput({
      parsed: {
        summary: "a summary",
        translatedTitle: "标题",
        translatedSummary: "摘要",
        translatedBodyMarkdown: "正文"
      },
      provider: "anthropic",
      model: "claude",
      targetLanguage: "zh-CN"
    });

    expect(output.summary).toBe("a summary");
    expect(output.translatedTitle).toBe("标题");
    expect(output.translatedSummary).toBe("摘要");
    expect(output.translatedBodyMarkdown).toBe("正文");
    expect(output.aiMeta).toMatchObject({ provider: "anthropic", model: "claude", targetLanguage: "zh-CN" });
    expect(typeof output.aiMeta.generatedAt).toBe("string");
  });

  it("omits empty fields and ignores non-string values", () => {
    const output = createParsedArticleAiOutput({
      parsed: { summary: "  ", translatedTitle: 42 },
      provider: "openai",
      model: "gpt",
      targetLanguage: "ja"
    });

    expect(output.summary).toBeUndefined();
    expect(output.translatedTitle).toBeUndefined();
    expect(output.translatedBodyMarkdown).toBeUndefined();
    expect(output.aiMeta.targetLanguage).toBe("ja");
  });
});
