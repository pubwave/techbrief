import { normalizeHtml } from "./normalize/html.js";
import { normalizeMarkdown } from "./normalize/markdown.js";
import { normalizePlainText } from "./normalize/plain-text.js";
import { resolveSourceContentProfile } from "./profiles/source-profiles.js";
import { toPubwaveDocument } from "./pubwave/to-document.js";
import type { ConversionInput, ConversionResult } from "./types.js";

export function convertContent(input: ConversionInput): ConversionResult {
  const normalized = normalizeContent(input);

  return {
    bodyNormalized: normalized.bodyNormalized,
    bodyAst: normalized.bodyAst,
    bodyTiptapJson: toPubwaveDocument(normalized.bodyAst)
  };
}

function normalizeContent(input: ConversionInput) {
  const profile = resolveSourceContentProfile(input.sourceId);
  switch (input.format) {
    case "html":
      return normalizeHtml(input.body, profile);
    case "markdown":
      return normalizeMarkdown(input.body);
    case "plain-text":
      return normalizePlainText(input.body);
  }
}
