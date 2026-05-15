import type {
  TiptapChartNode,
  TiptapContentNode,
  TiptapDocument,
  TiptapLayoutColumnNode,
  TiptapListItemNode,
  TiptapTableCellNode,
  TiptapTableRowNode,
  TiptapTextNode
} from "@techbrief/shared";
import type { ContentAstDocument, ContentAstNode, ContentTextSegment } from "../ast/types.js";
import { createDocument } from "../document-nodes.js";
import { DEFAULT_PUBWAVE_CAPABILITIES } from "./capabilities.js";
import { fallbackAstNode } from "./fallbacks.js";

export function toPubwaveDocument(ast: ContentAstDocument): TiptapDocument {
  return createDocument(ast.content.flatMap(mapAstNode));
}

function mapAstNode(node: ContentAstNode): TiptapContentNode[] {
  switch (node.type) {
    case "paragraph":
      return DEFAULT_PUBWAVE_CAPABILITIES.paragraph
        ? [{
        type: "paragraph",
        content: createTextContent(node.content)
      }]
        : fallbackAstNode(node);
    case "heading":
      return DEFAULT_PUBWAVE_CAPABILITIES.heading
        ? [{
        type: "heading",
        attrs: { level: node.level },
        content: createTextContent(node.content)
      }]
        : fallbackAstNode(node);
    case "blockquote":
      return DEFAULT_PUBWAVE_CAPABILITIES.blockquote
        ? [{
        type: "blockquote",
        content: [{ type: "paragraph", content: createTextContent(node.content) }]
      }]
        : fallbackAstNode(node);
    case "codeBlock":
      return DEFAULT_PUBWAVE_CAPABILITIES.codeBlock
        ? [{
        type: "codeBlock",
        ...(node.language ? { attrs: { language: node.language } } : {}),
        content: createTextContent([{ text: node.text }])
      }]
        : fallbackAstNode(node);
    case "bulletList":
      return DEFAULT_PUBWAVE_CAPABILITIES.bulletList
        ? [{
            type: "bulletList",
            content: node.items.map<TiptapListItemNode>((item) => ({
              type: "listItem",
              content: [{ type: "paragraph", content: createTextContent(item) }]
            }))
          }]
        : fallbackAstNode(node);
    case "orderedList":
      return DEFAULT_PUBWAVE_CAPABILITIES.orderedList
        ? [{
            type: "orderedList",
            content: node.items.map<TiptapListItemNode>((item) => ({
              type: "listItem",
              content: [{ type: "paragraph", content: createTextContent(item) }]
            }))
          }]
        : fallbackAstNode(node);
    case "taskList":
      return DEFAULT_PUBWAVE_CAPABILITIES.taskList
        ? [{
            type: "taskList",
            content: node.items.map((item) => ({
              type: "taskItem",
              attrs: { checked: item.checked },
              content: [{ type: "paragraph", content: createTextContent(item.content) }]
            }))
          }]
        : fallbackAstNode(node);
    case "horizontalRule":
      return DEFAULT_PUBWAVE_CAPABILITIES.horizontalRule ? [{ type: "horizontalRule" }] : fallbackAstNode(node);
    case "image":
      return DEFAULT_PUBWAVE_CAPABILITIES.image
        ? [{
        type: "image",
        attrs: {
          src: node.src,
          ...(node.alt ? { alt: node.alt } : {}),
          ...(node.title ? { title: node.title } : {})
        }
      }]
        : fallbackAstNode(node);
    case "table":
      return DEFAULT_PUBWAVE_CAPABILITIES.table
        ? [{
            type: "table",
            content: node.rows.map<TiptapTableRowNode>((row, rowIndex) => ({
              type: "tableRow",
              content: row.map<TiptapTableCellNode>((cell) => ({
                type: rowIndex === 0 ? "tableHeader" : "tableCell",
                content: [{ type: "paragraph", content: createTextContent(cell) }]
              }))
            }))
          }]
        : fallbackAstNode(node);
    case "chart":
      return DEFAULT_PUBWAVE_CAPABILITIES.chart
        ? [{
            type: "chart",
            attrs: { data: node.data }
          } as TiptapChartNode]
        : fallbackAstNode(node);
    case "layout":
      return DEFAULT_PUBWAVE_CAPABILITIES.layout
        ? [{
            type: "layout",
            attrs: { columns: node.columns },
            content: node.children.map<TiptapLayoutColumnNode>((child) => ({
              type: "layoutColumn",
              content: child.content.flatMap(mapAstNode)
            }))
          }]
        : fallbackAstNode(node);
    case "embed":
      return DEFAULT_PUBWAVE_CAPABILITIES.embed ? [] : fallbackAstNode(node);
    case "unknown":
      return DEFAULT_PUBWAVE_CAPABILITIES.unknown ? [] : fallbackAstNode(node);
  }
}

function createTextContent(segments: ContentTextSegment[]): TiptapTextNode[] {
  return segments
    .map<TiptapTextNode | null>((segment) => {
      if (!segment.text.trim()) {
        return null;
      }

      return {
        type: "text",
        text: segment.text,
        ...(segment.marks && segment.marks.length > 0
          ? {
              marks: segment.marks.map((mark) => (
                mark.type === "link"
                  ? { type: "link", attrs: { href: mark.attrs.href } }
                  : { type: mark.type }
              ))
            }
          : {})
      };
    })
    .filter((segment): segment is TiptapTextNode => Boolean(segment));
}
