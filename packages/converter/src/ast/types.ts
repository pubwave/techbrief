export type ContentInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "link"; attrs: { href: string } };

export interface ContentTextSegment {
  text: string;
  marks?: ContentInlineMark[];
}

export type ContentAstNode =
  | ParagraphAstNode
  | HeadingAstNode
  | BlockquoteAstNode
  | CodeBlockAstNode
  | ListAstNode
  | TaskListAstNode
  | HorizontalRuleAstNode
  | ImageAstNode
  | TableAstNode
  | ChartAstNode
  | LayoutAstNode
  | EmbedAstNode
  | UnknownAstNode;

export interface ContentAstDocument {
  type: "document";
  content: ContentAstNode[];
}

export interface ParagraphAstNode {
  type: "paragraph";
  content: ContentTextSegment[];
}

export interface HeadingAstNode {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: ContentTextSegment[];
}

export interface BlockquoteAstNode {
  type: "blockquote";
  content: ContentTextSegment[];
}

export interface CodeBlockAstNode {
  type: "codeBlock";
  text: string;
  language?: string;
}

export interface ListAstNode {
  type: "bulletList" | "orderedList";
  items: ContentTextSegment[][];
}

export interface TaskListAstNode {
  type: "taskList";
  items: Array<{ content: ContentTextSegment[]; checked: boolean }>;
}

export interface HorizontalRuleAstNode {
  type: "horizontalRule";
}

export interface ImageAstNode {
  type: "image";
  src: string;
  alt?: string;
  title?: string;
}

export interface TableAstNode {
  type: "table";
  rows: ContentTextSegment[][][];
}

export interface ChartAstNode {
  type: "chart";
  data: Record<string, unknown>;
}

export interface LayoutAstNode {
  type: "layout";
  columns: 2 | 3;
  children: ContentAstDocument[];
}

export interface EmbedAstNode {
  type: "embed";
  url: string;
  provider?: string;
}

export interface UnknownAstNode {
  type: "unknown";
  fallbackText: string;
}
