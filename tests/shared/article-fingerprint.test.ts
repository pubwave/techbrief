import { describe, expect, it } from "vitest";
import {
  buildArticleBodyFingerprint,
  buildArticleContentHash
} from "../../packages/shared/src/article/fingerprint.js";
import { makeArticle } from "../_fixtures.js";

describe("buildArticleBodyFingerprint", () => {
  it("is null when the article has no body", () => {
    expect(buildArticleBodyFingerprint(makeArticle())).toBeNull();
  });

  it("is a stable 64-char sha256 hex for the same body", () => {
    const a = buildArticleBodyFingerprint(makeArticle({ bodyRaw: "shared body text" }));
    const b = buildArticleBodyFingerprint(makeArticle({ bodyRaw: "shared body text", id: "other" }));
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different bodies", () => {
    expect(buildArticleBodyFingerprint(makeArticle({ bodyRaw: "one" }))).not.toBe(
      buildArticleBodyFingerprint(makeArticle({ bodyRaw: "two" }))
    );
  });

  it("matches the known sha256 of the body text", () => {
    // sha256("abc")
    expect(buildArticleBodyFingerprint(makeArticle({ bodyRaw: "abc" }))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );
  });
});

describe("buildArticleContentHash", () => {
  it("hashes empty string when there is no body (sha256 of '')", () => {
    expect(buildArticleContentHash(makeArticle())).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });
});
