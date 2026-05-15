import type { TiptapContentNode } from "@techbrief/shared";
import type { ContentAstNode, ContentTextSegment } from "../ast/types.js";

export function fallbackAstNode(node: ContentAstNode): TiptapContentNode[] {
  switch (node.type) {
    case "image":
      return [
        createParagraph(`${node.alt?.trim() || "Image"}: ${node.src}`)
      ];
    case "table":
      return node.rows
        .filter((row) => row.some((cell) => toPlainText(cell).trim().length > 0))
        .map((row) => createParagraph(row.map(toPlainText).join(" | ")));
    case "taskList":
      return node.items.map((item) => createParagraph(`${item.checked ? "[x]" : "[ ]"} ${toPlainText(item.content)}`));
    case "chart":
      return [createParagraph(`Chart: ${JSON.stringify(node.data)}`)];
    case "layout":
      return node.children.flatMap((child, index) => [
        createParagraph(`Column ${index + 1}`),
        ...child.content.flatMap(fallbackAstNode)
      ]);
    case "embed":
      return [createParagraph(`${node.provider ? `${node.provider}: ` : ""}${node.url}`)];
    case "unknown":
      return [createParagraph(node.fallbackText)];
    case "paragraph":
    case "heading":
    case "blockquote":
      return [createParagraph(toPlainText(node.content))];
    case "bulletList":
    case "orderedList":
      return node.items.map((item) => createParagraph(toPlainText(item)));
    default:
      return [];
  }
}

function createParagraph(text: string): TiptapContentNode {
  return {
    type: "paragraph",
    content: text.trim() ? [{ type: "text", text: text.trim() }] : []
  };
}

function toPlainText(segments: ContentTextSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}
