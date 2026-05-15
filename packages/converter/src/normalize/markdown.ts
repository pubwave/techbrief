import type { ContentAstDocument } from "../ast/types.js";
import { parseMarkdownAst } from "../parse/markdown-ast.js";

export function normalizeMarkdown(input: string): { bodyNormalized: string; bodyAst: ContentAstDocument } {
  const bodyNormalized = input.replace(/\r\n/g, "\n").trim();
  return {
    bodyNormalized,
    bodyAst: parseMarkdownAst(bodyNormalized)
  };
}
