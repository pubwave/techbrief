import type { TiptapDocument } from "@techbrief/shared";
import type { ContentAstDocument } from "./ast/types.js";

export type ContentInputFormat = "html" | "markdown" | "plain-text";

export interface ConversionInput {
  sourceId: string;
  format: ContentInputFormat;
  body: string;
}

export interface ConversionResult {
  bodyNormalized: string;
  bodyAst: ContentAstDocument;
  bodyTiptapJson: TiptapDocument;
}
