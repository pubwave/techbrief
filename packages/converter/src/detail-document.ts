import type { TiptapContentNode, TiptapDocument } from "@techbrief/shared";
import { createDocument, createParagraph, createParagraphFromText, createText } from "./document-nodes.js";

interface DetailTag {
  label: string;
  tone?: "primary" | "neutral";
  variant?: "soft" | "outline" | "solid";
  size?: "sm" | "md";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export interface DetailDocumentInput {
  title: string;
  summary?: string;
  metadata?: string[];
  metadataTags?: DetailTag[];
  bodyDocument?: TiptapDocument;
  bodyFallback?: string;
  originalUrl?: string;
  originalUrlLabel?: string;
}

export function buildDetailDocument(input: DetailDocumentInput): TiptapDocument {
  const content: TiptapContentNode[] = [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [createText(input.title)]
    }
  ];

  if (input.summary?.trim()) {
    content.push(createParagraphFromText(input.summary.trim()));
  }

  const metadataNode = createMetadataNode(input.metadataTags, input.metadata);
  if (metadataNode) {
    content.push(metadataNode);
  }

  const bodyContent = getBodyContent(input.bodyDocument, input.bodyFallback);
  if (bodyContent.length > 0) {
    content.push({ type: "horizontalRule" });
    content.push(...bodyContent);
  }

  if (input.originalUrl && input.originalUrlLabel?.trim()) {
    content.push({ type: "horizontalRule" });
    content.push(createParagraph([createText(input.originalUrlLabel.trim(), input.originalUrl)]));
  }

  return createDocument(content);
}

function createMetadataNode(
  metadataTags: DetailTag[] | undefined,
  metadata: string[] | undefined
): TiptapContentNode | null {
  const tagNodes = (metadataTags ?? [])
    .map((tag) => tag.label.trim())
    .filter(Boolean)
    .map((label, index, items) => {
      const tone = metadataTags?.[index]?.tone ?? "primary";
      const variant = metadataTags?.[index]?.variant ?? "soft";
      const size = metadataTags?.[index]?.size ?? "md";
      const tagOptions = {
        tone,
        variant,
        size,
        ...(metadataTags?.[index]?.backgroundColor ? { backgroundColor: metadataTags[index].backgroundColor } : {}),
        ...(metadataTags?.[index]?.textColor ? { textColor: metadataTags[index].textColor } : {}),
        ...(metadataTags?.[index]?.borderColor ? { borderColor: metadataTags[index].borderColor } : {})
      };
      return [
        createText(label, { tag: tagOptions }),
        ...(index < items.length - 1 ? [createText(" ")] : [])
      ];
    })
    .flat();

  const metadataItems = (metadata ?? []).map((item) => item.trim()).filter(Boolean);
  const metadataText = metadataItems.join(" · ");
  const textNodes = metadataText ? [createText(metadataText)] : [];

  if (tagNodes.length === 0 && textNodes.length === 0) {
    return null;
  }

  const paragraphContent = tagNodes.length > 0 && textNodes.length > 0
    ? [...tagNodes, createText("  "), ...textNodes]
    : [...tagNodes, ...textNodes];

  return createParagraph(paragraphContent);
}

function getBodyContent(bodyDocument: TiptapDocument | undefined, bodyFallback: string | undefined): TiptapContentNode[] {
  if (bodyDocument?.type === "doc" && Array.isArray(bodyDocument.content) && bodyDocument.content.length > 0) {
    return bodyDocument.content;
  }

  return (bodyFallback ?? "")
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => createParagraphFromText(paragraph));
}
