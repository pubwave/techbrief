import { createEmbedNode, createImageNode, createTableNode } from "../ast/builders.js";
import type { ContentAstDocument } from "../ast/types.js";
import { normalizeWhitespace } from "../normalize/common.js";
import { parseInlineMarkdownText } from "./inline-text.js";

const IMAGE_LINE_PATTERN = /^!\[(.*?)\]\((.+?)\)$/;
const EMBED_LINK_PATTERN = /^\[(?:Embedded content|Embed)\]\((.+?)\)$/i;
const TASK_ITEM_PATTERN = /^[-*]\s+\[( |x|X)\]\s+(.*)$/;

export function parseStandaloneMarkdownLine(line: string): ContentAstDocument["content"][number] | null {
  const imageMatch = line.match(IMAGE_LINE_PATTERN);
  if (imageMatch) {
    const alt = normalizeWhitespace(imageMatch[1] ?? "");
    const src = (imageMatch[2] ?? "").trim();
    if (!src) {
      return null;
    }

    return createImageNode(src, alt || undefined);
  }

  const embedMatch = line.match(EMBED_LINK_PATTERN);
  if (embedMatch) {
    const url = (embedMatch[1] ?? "").trim();
    return url ? createEmbedNode(url) : null;
  }

  const taskMatch = line.match(TASK_ITEM_PATTERN);
  if (taskMatch) {
    return null;
  }

  return null;
}

export function parseTaskListItems(lines: string[], startIndex: number): {
  items: Array<{ content: ReturnType<typeof parseInlineMarkdownText>; checked: boolean }>;
  nextIndex: number;
} | null {
  const items: Array<{ content: ReturnType<typeof parseInlineMarkdownText>; checked: boolean }> = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = (lines[index] ?? "").trim();
    const match = line.match(TASK_ITEM_PATTERN);
    if (!match) {
      break;
    }

    items.push({
      checked: (match[1] ?? " ").toLowerCase() === "x",
      content: parseInlineMarkdownText(normalizeWhitespace(match[2] ?? ""))
    });
    index += 1;
  }

  return items.length > 0 ? { items, nextIndex: index } : null;
}

export function parseMarkdownTable(lines: string[], startIndex: number): {
  node: ContentAstDocument["content"][number] | null;
  nextIndex: number;
} | null {
  const header = parseTableRow(lines[startIndex] ?? "");
  const separator = lines[startIndex + 1] ?? "";

  if (!header || !isTableSeparator(separator)) {
    return null;
  }

  const rows = [header];
  let index = startIndex + 2;

  while (index < lines.length) {
    const row = parseTableRow(lines[index] ?? "");
    if (!row) {
      break;
    }
    rows.push(row);
    index += 1;
  }

  return {
    node: createTableNode(rows),
    nextIndex: index
  };
}

function parseTableRow(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }

  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => parseInlineMarkdownText(normalizeWhitespace(cell)))
    .filter((cell) => cell.length > 0);
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return false;
  }

  const cells = trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => normalizeWhitespace(cell));
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}
