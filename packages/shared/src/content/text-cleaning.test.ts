import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeArticleText } from "./text-cleaning.js";

test("sanitizeArticleText decodes escaped html tags into readable text", () => {
  assert.equal(
    sanitizeArticleText(
      "&lt;img src=\"https://storage.googleapis.com/gweb-uniblog-publish-prod/images/UKTransport-hero.webp\"&gt;The UK’s Department for Transport uses Google Cloud AI to analyze feedback."
    ),
    "The UK’s Department for Transport uses Google Cloud AI to analyze feedback."
  );
});

test("sanitizeArticleText strips inline html while preserving readable content", () => {
  assert.equal(
    sanitizeArticleText(
      "<div class=\"feat-image\"><img src=\"https://9to5mac.com/dope-thief.jpg?quality=82&#038;strip=all&#038;w=1600\" /></div><p>Apple TV confirmed today that Brian Tyree Henry is joining a new feature film from Apple Original Films.</p><a href=\"https://9to5mac.com/more\">more…</a>"
    ),
    "Apple TV confirmed today that Brian Tyree Henry is joining a new feature film from Apple Original Films. more…"
  );
});

test("sanitizeArticleText decodes numeric entities in titles", () => {
  assert.equal(
    sanitizeArticleText("What&#8217;s new in Android&#8217;s April 2026 Google System Updates [U]"),
    "What’s new in Android’s April 2026 Google System Updates [U]"
  );
});

test("sanitizeArticleText extracts text from parsed feed objects", () => {
  assert.equal(
    sanitizeArticleText({
      "#text": "The Verge headline",
      a: {
        href: "https://www.theverge.com/example",
        "#text": "ignored nested duplicate"
      }
    }),
    "The Verge headline"
  );
});

test("sanitizeArticleText extracts text from nested feed arrays", () => {
  assert.equal(
    sanitizeArticleText({
      p: [
        { "#text": "First sentence." },
        { "#text": "Second sentence." }
      ]
    }),
    "First sentence. Second sentence."
  );
});
