import type { ContentAstDocument } from "../ast/types.js";
import { decodeHtmlEntities } from "../html-entities.js";
import { parseMarkdownAst } from "../parse/markdown-ast.js";

export function normalizeMarkdown(input: string): { bodyNormalized: string; bodyAst: ContentAstDocument } {
  const bodyNormalized = decodeHtmlEntities(input.replace(/\r\n/g, "\n")).trim();
  return {
    bodyNormalized,
    bodyAst: parseMarkdownAst(bodyNormalized)
  };
}
