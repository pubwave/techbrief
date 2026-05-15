import { createPlainTextSegments } from "../ast/builders.js";
import type { ContentAstDocument, ContentAstNode, ContentTextSegment } from "../ast/types.js";

export function serializeAstToMarkdown(document: ContentAstDocument): string {
  return document.content.map(serializeNode).filter(Boolean).join("\n\n").trim();
}

function serializeNode(node: ContentAstNode): string {
  switch (node.type) {
    case "paragraph":
      return renderInlineSegments(node.content);
    case "heading":
      return `${"#".repeat(node.level)} ${renderInlineSegments(node.content)}`.trim();
    case "blockquote":
      return `> ${renderInlineSegments(node.content)}`.trim();
    case "codeBlock":
      return [`\`\`\`${node.language ?? ""}`.trimEnd(), node.text, "```"].join("\n");
    case "bulletList":
      return node.items.map((item) => `- ${renderInlineSegments(item)}`).join("\n");
    case "orderedList":
      return node.items.map((item, index) => `${index + 1}. ${renderInlineSegments(item)}`).join("\n");
    case "taskList":
      return node.items.map((item) => `- [${item.checked ? "x" : " "}] ${renderInlineSegments(item.content)}`).join("\n");
    case "horizontalRule":
      return "---";
    case "image":
      return node.alt?.trim() ? `![${node.alt}](${node.src})` : `![](${node.src})`;
    case "table":
      return serializeTable(node.rows);
    case "chart":
      return `\`\`\`pubwave-chart\n${JSON.stringify(node.data, null, 2)}\n\`\`\``;
    case "layout":
      return node.children.map((child, index) => `<!-- pubwave-layout-column:${index + 1}/${node.columns} -->\n${serializeAstToMarkdown(child)}`).join("\n\n");
    case "embed":
      return `[Embedded content](${node.url})`;
    case "unknown":
      return node.fallbackText;
  }
}

function serializeTable(rows: ContentTextSegment[][][]): string {
  if (rows.length === 0) {
    return "";
  }

  const header = rows[0];
  const rest = rows.slice(1);
  const normalizedHeader = header && header.length > 0 ? header : [createPlainTextSegments("Column")];
  const separator = normalizedHeader.map(() => "---");
  const lines = [
    `| ${normalizedHeader.map(renderInlineSegments).join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rest.map((row) => `| ${row.map(renderInlineSegments).join(" | ")} |`)
  ];

  return lines.join("\n");
}

function renderInlineSegments(segments: ContentTextSegment[]): string {
  return segments
    .map((segment) => {
      const base = segment.text;
      return (segment.marks ?? []).reduce((value, mark) => {
        switch (mark.type) {
          case "bold":
            return `**${value}**`;
          case "italic":
            return `*${value}*`;
          case "underline":
            return `++${value}++`;
          case "strike":
            return `~~${value}~~`;
          case "code":
            return `\`${value}\``;
          case "link":
            return `[${value}](${mark.attrs.href})`;
        }
      }, base);
    })
    .join("");
}
