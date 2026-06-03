import { describe, expect, it } from "vitest";
import { getArticlePromptBody, getArticleSourceBody, hasArticleSourceBody } from "../../packages/shared/src/article/body.js";
import { makeArticle } from "../_fixtures.js";

describe("getArticleSourceBody", () => {
  it("prefers bodyRaw over bodyNormalized", () => {
    expect(getArticleSourceBody(makeArticle({ bodyRaw: "raw", bodyNormalized: "norm" }))).toBe("raw");
  });

  it("falls back to bodyNormalized when raw is blank", () => {
    expect(getArticleSourceBody(makeArticle({ bodyRaw: "   ", bodyNormalized: "norm" }))).toBe("norm");
  });

  it("is undefined when neither body is present", () => {
    expect(getArticleSourceBody(makeArticle())).toBeUndefined();
  });
});

describe("hasArticleSourceBody", () => {
  it("reflects presence of a usable body", () => {
    expect(hasArticleSourceBody(makeArticle({ bodyRaw: "x" }))).toBe(true);
    expect(hasArticleSourceBody(makeArticle())).toBe(false);
  });
});

describe("getArticlePromptBody", () => {
  it("uses the body, then summary, then title, then empty string", () => {
    expect(getArticlePromptBody(makeArticle({ bodyRaw: "body" }))).toBe("body");
    expect(getArticlePromptBody(makeArticle({ summary: "sum" }))).toBe("sum");
    expect(getArticlePromptBody(makeArticle({ title: "just a title" }))).toBe("just a title");
    expect(getArticlePromptBody(makeArticle({ title: "   " }))).toBe("");
  });
});
