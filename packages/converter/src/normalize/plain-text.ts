import { createAstDocument, createParagraphNode } from "../ast/builders.js";
import type { ContentAstDocument } from "../ast/types.js";
import { normalizeWhitespace, splitParagraphs } from "./common.js";

export function normalizePlainText(input: string): { bodyNormalized: string; bodyAst: ContentAstDocument } {
  const bodyNormalized = input.replace(/\r\n/g, "\n").trim();
  const bodyAst = createAstDocument(
    splitParagraphs(bodyNormalized).map((paragraph) => createParagraphNode(normalizeWhitespace(paragraph)))
  );

  return { bodyNormalized, bodyAst };
}
