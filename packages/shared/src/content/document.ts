export interface TiptapTextNode {
  type: "text";
  text: string;
  marks?: Array<{
    type: "bold" | "italic" | "underline" | "strike" | "code" | "link" | "tag";
    attrs?: Record<string, string>;
  }>;
}

export interface TiptapParagraphNode {
  type: "paragraph";
  content?: TiptapTextNode[];
}

export interface TiptapHeadingNode {
  type: "heading";
  attrs: { level: 1 | 2 | 3 | 4 | 5 | 6 };
  content?: TiptapTextNode[];
}

export interface TiptapCodeBlockNode {
  type: "codeBlock";
  attrs?: { language?: string };
  content?: TiptapTextNode[];
}

export interface TiptapBlockquoteNode {
  type: "blockquote";
  content: TiptapContentNode[];
}

export interface TiptapHardBreakNode {
  type: "hardBreak";
}

export interface TiptapListItemNode {
  type: "listItem";
  content: TiptapContentNode[];
}

export interface TiptapListNode {
  type: "bulletList" | "orderedList";
  content: TiptapListItemNode[];
}

export interface TiptapTaskItemNode {
  type: "taskItem";
  attrs?: { checked?: boolean };
  content: TiptapContentNode[];
}

export interface TiptapTaskListNode {
  type: "taskList";
  content: TiptapTaskItemNode[];
}

export interface TiptapHorizontalRuleNode {
  type: "horizontalRule";
}

export interface TiptapImageNode {
  type: "image";
  attrs: {
    src: string;
    alt?: string;
    title?: string;
  };
}

export interface TiptapTableCellNode {
  type: "tableCell" | "tableHeader";
  content: TiptapContentNode[];
}

export interface TiptapTableRowNode {
  type: "tableRow";
  content: TiptapTableCellNode[];
}

export interface TiptapTableNode {
  type: "table";
  content: TiptapTableRowNode[];
}

export interface TiptapChartNode {
  type: "chart";
  attrs?: {
    data?: Record<string, unknown>;
  };
}

export interface TiptapLayoutColumnNode {
  type: "layoutColumn";
  content: TiptapContentNode[];
}

export interface TiptapLayoutNode {
  type: "layout";
  attrs?: {
    columns?: 2 | 3;
  };
  content: TiptapLayoutColumnNode[];
}

export type TiptapContentNode =
  | TiptapParagraphNode
  | TiptapHeadingNode
  | TiptapCodeBlockNode
  | TiptapBlockquoteNode
  | TiptapListNode
  | TiptapListItemNode
  | TiptapTaskListNode
  | TiptapTaskItemNode
  | TiptapHorizontalRuleNode
  | TiptapImageNode
  | TiptapTableNode
  | TiptapTableRowNode
  | TiptapTableCellNode
  | TiptapChartNode
  | TiptapLayoutNode
  | TiptapLayoutColumnNode;

export interface TiptapDocument {
  type: "doc";
  content: TiptapContentNode[];
}
