import { describe, expect, it } from "vitest";
import { serializeAstToMarkdown } from "../../packages/converter/src/serialize/ast-markdown.js";
import type { ContentAstDocument } from "../../packages/converter/src/ast/types.js";

function doc(...content: ContentAstDocument["content"]): ContentAstDocument {
  return { type: "document", content };
}

describe("serializeAstToMarkdown", () => {
  it("renders a paragraph", () => {
    expect(serializeAstToMarkdown(doc({ type: "paragraph", content: [{ text: "Hello" }] }))).toBe("Hello");
  });

  it("renders headings with the right level", () => {
    expect(serializeAstToMarkdown(doc({ type: "heading", level: 2, content: [{ text: "Title" }] }))).toBe("## Title");
  });

  it("renders inline marks", () => {
    const document = doc({
      type: "paragraph",
      content: [
        { text: "bold", marks: [{ type: "bold" }] },
        { text: " and " },
        { text: "link", marks: [{ type: "link", attrs: { href: "https://x.dev" } }] }
      ]
    });
    expect(serializeAstToMarkdown(document)).toBe("**bold** and [link](https://x.dev)");
  });

  it("renders bullet and ordered lists", () => {
    expect(
      serializeAstToMarkdown(doc({ type: "bulletList", items: [[{ text: "a" }], [{ text: "b" }]] }))
    ).toBe("- a\n- b");
    expect(
      serializeAstToMarkdown(doc({ type: "orderedList", items: [[{ text: "a" }], [{ text: "b" }]] }))
    ).toBe("1. a\n2. b");
  });

  it("renders a fenced code block with language", () => {
    expect(
      serializeAstToMarkdown(doc({ type: "codeBlock", language: "ts", text: "const x = 1;" }))
    ).toBe("```ts\nconst x = 1;\n```");
  });

  it("renders images and horizontal rules", () => {
    expect(serializeAstToMarkdown(doc({ type: "image", src: "https://x/y.png", alt: "cat" }))).toBe(
      "![cat](https://x/y.png)"
    );
    expect(serializeAstToMarkdown(doc({ type: "horizontalRule" }))).toBe("---");
  });

  it("joins multiple blocks with blank lines", () => {
    const out = serializeAstToMarkdown(
      doc({ type: "heading", level: 1, content: [{ text: "H" }] }, { type: "paragraph", content: [{ text: "p" }] })
    );
    expect(out).toBe("# H\n\np");
  });
});
