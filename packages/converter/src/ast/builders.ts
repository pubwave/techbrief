import type {
  BlockquoteAstNode,
  CodeBlockAstNode,
  ContentInlineMark,
  ContentAstDocument,
  ContentTextSegment,
  HeadingAstNode,
  HorizontalRuleAstNode,
  ImageAstNode,
  ListAstNode,
  ParagraphAstNode,
  TableAstNode,
  TaskListAstNode,
  EmbedAstNode,
  ChartAstNode,
  LayoutAstNode,
  UnknownAstNode
} from "./types.js";

export function createAstDocument(content: ContentAstDocument["content"]): ContentAstDocument {
  return {
    type: "document",
    content
  };
}

export function createTextSegment(text: string, marks?: ContentInlineMark[]): ContentTextSegment {
  return marks && marks.length > 0 ? { text, marks } : { text };
}

export function createPlainTextSegments(text: string): ContentTextSegment[] {
  return text.trim() ? [createTextSegment(text)] : [];
}

export function createParagraphNode(content: string | ContentTextSegment[]): ParagraphAstNode {
  return {
    type: "paragraph",
    content: typeof content === "string" ? createPlainTextSegments(content) : content
  };
}

export function createHeadingNode(level: number, content: string | ContentTextSegment[]): HeadingAstNode {
  return {
    type: "heading",
    level: Math.min(Math.max(level, 1), 6) as HeadingAstNode["level"],
    content: typeof content === "string" ? createPlainTextSegments(content) : content
  };
}

export function createBlockquoteNode(content: string | ContentTextSegment[]): BlockquoteAstNode {
  return {
    type: "blockquote",
    content: typeof content === "string" ? createPlainTextSegments(content) : content
  };
}

export function createCodeBlockNode(text: string, language?: string): CodeBlockAstNode {
  return language ? { type: "codeBlock", text, language } : { type: "codeBlock", text };
}

export function createListNode(type: ListAstNode["type"], items: Array<string | ContentTextSegment[]>): ListAstNode {
  return {
    type,
    items: items.map((item) => typeof item === "string" ? createPlainTextSegments(item) : item)
  };
}

export function createTaskListNode(
  items: Array<{ content: string | ContentTextSegment[]; checked: boolean }>
): TaskListAstNode {
  return {
    type: "taskList",
    items: items.map((item) => ({
      checked: item.checked,
      content: typeof item.content === "string" ? createPlainTextSegments(item.content) : item.content
    }))
  };
}

export function createHorizontalRuleNode(): HorizontalRuleAstNode {
  return { type: "horizontalRule" };
}

export function createImageNode(src: string, alt?: string, title?: string): ImageAstNode {
  return {
    type: "image",
    src,
    ...(alt ? { alt } : {}),
    ...(title ? { title } : {})
  };
}

export function createTableNode(rows: Array<Array<string | ContentTextSegment[]>>): TableAstNode {
  return {
    type: "table",
    rows: rows.map((row) => row.map((cell) => typeof cell === "string" ? createPlainTextSegments(cell) : cell))
  };
}

export function createChartNode(data: Record<string, unknown>): ChartAstNode {
  return { type: "chart", data };
}

export function createLayoutNode(columns: 2 | 3, children: LayoutAstNode["children"]): LayoutAstNode {
  return { type: "layout", columns, children };
}

export function createEmbedNode(url: string, provider?: string): EmbedAstNode {
  return provider ? { type: "embed", url, provider } : { type: "embed", url };
}

export function createUnknownNode(fallbackText: string): UnknownAstNode {
  return { type: "unknown", fallbackText };
}
