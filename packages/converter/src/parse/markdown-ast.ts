import {
  createAstDocument,
  createBlockquoteNode,
  createChartNode,
  createCodeBlockNode,
  createHeadingNode,
  createHorizontalRuleNode,
  createLayoutNode,
  createListNode,
  createParagraphNode,
  createTaskListNode
} from "../ast/builders.js";
import type { ContentAstDocument } from "../ast/types.js";
import { normalizeWhitespace } from "../normalize/common.js";
import { parseMarkdownTable, parseStandaloneMarkdownLine, parseTaskListItems } from "./markdown-rich-lines.js";
import { parseInlineMarkdownText } from "./inline-text.js";

export function parseMarkdownAst(input: string): ContentAstDocument {
  const lines = input.split("\n");
  const nodes: ContentAstDocument["content"] = [];
  let codeBuffer: string[] = [];
  let codeLanguage: string | undefined;
  let listBuffer: Array<ReturnType<typeof parseInlineMarkdownText>> = [];
  let listType: "bulletList" | "orderedList" | null = null;
  let layoutColumns: ContentAstDocument["content"][] | null = null;
  let layoutColumnTotal: 2 | 3 | null = null;
  let currentLayoutColumnIndex = 0;
  let inCodeBlock = false;

  const flushList = () => {
    if (!listType || listBuffer.length === 0) {
      return;
    }

    nodes.push(createListNode(listType, [...listBuffer]));
    listBuffer = [];
    listType = null;
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) {
      return;
    }

    const body = codeBuffer.join("\n");
    if (codeLanguage === "pubwave-chart") {
      try {
        const data = JSON.parse(body) as Record<string, unknown>;
        nodes.push(createChartNode(data));
      } catch {
        nodes.push(createCodeBlockNode(body, codeLanguage));
      }
    } else {
      nodes.push(createCodeBlockNode(body, codeLanguage));
    }
    codeBuffer = [];
    codeLanguage = undefined;
  };

  const flushLayout = () => {
    if (!layoutColumns || !layoutColumnTotal) {
      return;
    }

    nodes.push(createLayoutNode(layoutColumnTotal, layoutColumns.map((content) => createAstDocument(content))));
    layoutColumns = null;
    layoutColumnTotal = null;
    currentLayoutColumnIndex = 0;
  };

  const appendNode = (node: ContentAstDocument["content"][number]) => {
    if (layoutColumns) {
      layoutColumns[currentLayoutColumnIndex]?.push(node);
      return;
    }

    nodes.push(node);
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushList();
        codeLanguage = line.slice(3).trim() || undefined;
      }

      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushList();
      if (!layoutColumns) {
        flushLayout();
      }
      continue;
    }

    const layoutMatch = line.trim().match(/^<!--\s*pubwave-layout-column:(\d+)\/([23])\s*-->$/);
    if (layoutMatch) {
      flushList();
      flushCode();
      const columnIndex = Math.max(0, Number.parseInt(layoutMatch[1] ?? "1", 10) - 1);
      const totalColumns = Number.parseInt(layoutMatch[2] ?? "2", 10) as 2 | 3;
      if (!layoutColumns || layoutColumnTotal !== totalColumns) {
        flushLayout();
        layoutColumnTotal = totalColumns;
        layoutColumns = Array.from({ length: totalColumns }, () => []);
      }
      currentLayoutColumnIndex = Math.min(columnIndex, totalColumns - 1);
      continue;
    }

    const taskListResult = parseTaskListItems(lines, index);
    if (taskListResult) {
      flushList();
      appendNode(createTaskListNode(taskListResult.items));
      index = taskListResult.nextIndex - 1;
      continue;
    }

    const tableResult = parseMarkdownTable(lines, index);
    if (tableResult) {
      flushList();
      if (tableResult.node) {
        appendNode(tableResult.node);
      }
      index = tableResult.nextIndex - 1;
      continue;
    }

    const standaloneNode = parseStandaloneMarkdownLine(line.trim());
    if (standaloneNode) {
      flushList();
      appendNode(standaloneNode);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      appendNode(
        createHeadingNode((headingMatch[1] ?? "#").length, parseInlineMarkdownText(normalizeWhitespace(headingMatch[2] ?? "")))
      );
      continue;
    }

    if (line.startsWith(">")) {
      flushList();
      appendNode(createBlockquoteNode(parseInlineMarkdownText(normalizeWhitespace(line.replace(/^>\s?/, "")))));
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listType = "bulletList";
      listBuffer.push(parseInlineMarkdownText(normalizeWhitespace(line.replace(/^[-*]\s+/, ""))));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      listType = "orderedList";
      listBuffer.push(parseInlineMarkdownText(normalizeWhitespace(line.replace(/^\d+\.\s+/, ""))));
      continue;
    }

    flushList();
    if (/^---+$/.test(line)) {
      appendNode(createHorizontalRuleNode());
      continue;
    }

    const inlineSegments = parseInlineMarkdownText(normalizeWhitespace(line));
    if (inlineSegments.length > 0) {
      appendNode(createParagraphNode(inlineSegments));
    }
  }

  flushList();
  flushCode();
  flushLayout();

  return createAstDocument(nodes);
}
