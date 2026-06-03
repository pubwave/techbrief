import { describe, expect, it } from "vitest";
import { normalizeWhitespace, sanitizeArticleText } from "../../packages/shared/src/content/text-cleaning.js";

describe("sanitizeArticleText", () => {
  it("decodes escaped html tags into readable text", () => {
    expect(
      sanitizeArticleText(
        "&lt;img src=\"https://storage.googleapis.com/gweb-uniblog-publish-prod/images/UKTransport-hero.webp\"&gt;The UK’s Department for Transport uses Google Cloud AI to analyze feedback."
      )
    ).toBe("The UK’s Department for Transport uses Google Cloud AI to analyze feedback.");
  });

  it("strips inline html while preserving readable content", () => {
    expect(
      sanitizeArticleText(
        "<div class=\"feat-image\"><img src=\"https://9to5mac.com/dope-thief.jpg?quality=82&#038;strip=all&#038;w=1600\" /></div><p>Apple TV confirmed today that Brian Tyree Henry is joining a new feature film from Apple Original Films.</p><a href=\"https://9to5mac.com/more\">more…</a>"
      )
    ).toBe(
      "Apple TV confirmed today that Brian Tyree Henry is joining a new feature film from Apple Original Films. more…"
    );
  });

  it("decodes numeric entities in titles", () => {
    expect(
      sanitizeArticleText("What&#8217;s new in Android&#8217;s April 2026 Google System Updates [U]")
    ).toBe("What’s new in Android’s April 2026 Google System Updates [U]");
  });

  it("extracts the priority text key from parsed feed objects", () => {
    expect(
      sanitizeArticleText({
        "#text": "The Verge headline",
        a: { href: "https://www.theverge.com/example", "#text": "ignored nested duplicate" }
      })
    ).toBe("The Verge headline");
  });

  it("extracts text from nested feed arrays", () => {
    expect(
      sanitizeArticleText({
        p: [{ "#text": "First sentence." }, { "#text": "Second sentence." }]
      })
    ).toBe("First sentence. Second sentence.");
  });

  it("returns undefined for empty or nullish input", () => {
    expect(sanitizeArticleText("")).toBeUndefined();
    expect(sanitizeArticleText("   ")).toBeUndefined();
    expect(sanitizeArticleText(null)).toBeUndefined();
    expect(sanitizeArticleText(undefined)).toBeUndefined();
  });

  it("passes through plain text, collapsing whitespace", () => {
    expect(sanitizeArticleText("  hello   world  ")).toBe("hello world");
  });
});

describe("normalizeWhitespace", () => {
  it("collapses runs of whitespace and trims", () => {
    expect(normalizeWhitespace("a\n\t  b   c ")).toBe("a b c");
  });
});
