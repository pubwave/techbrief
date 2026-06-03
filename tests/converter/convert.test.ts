import { describe, expect, it } from "vitest";
import { convertContent } from "../../packages/converter/src/convert.js";

describe("convertContent", () => {
  it("converts markdown into normalized text, an AST, and a tiptap document", () => {
    const result = convertContent({
      sourceId: "src",
      format: "markdown",
      body: "# Title\n\nA paragraph with **bold**."
    });

    expect(typeof result.bodyNormalized).toBe("string");
    expect(result.bodyNormalized.length).toBeGreaterThan(0);
    expect(result.bodyAst).toMatchObject({ type: "document" });
    expect(Array.isArray((result.bodyAst as { content: unknown[] }).content)).toBe(true);
    expect(result.bodyTiptapJson).toMatchObject({ type: "doc" });
  });

  it("converts plain text", () => {
    const result = convertContent({ sourceId: "src", format: "plain-text", body: "just words" });
    expect(result.bodyNormalized).toContain("just words");
    expect(result.bodyAst).toMatchObject({ type: "document" });
  });

  it("converts html", () => {
    const result = convertContent({
      sourceId: "src",
      format: "html",
      body: "<h1>Hi</h1><p>there</p>"
    });
    expect(result.bodyAst).toMatchObject({ type: "document" });
    expect((result.bodyAst as { content: unknown[] }).content.length).toBeGreaterThan(0);
  });

  it("round-trips markdown structure back through the serializer", async () => {
    const { serializeAstToMarkdown } = await import("../../packages/converter/src/serialize/ast-markdown.js");
    const result = convertContent({ sourceId: "src", format: "markdown", body: "## Heading\n\nbody text" });
    const markdown = serializeAstToMarkdown(result.bodyAst as Parameters<typeof serializeAstToMarkdown>[0]);
    expect(markdown).toContain("## Heading");
    expect(markdown).toContain("body text");
  });
});
