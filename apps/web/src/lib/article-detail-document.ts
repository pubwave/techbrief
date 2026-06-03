import { buildDetailDocument } from "@techbrief/converter";
import type { TiptapContentNode, TiptapDocument, TiptapTextNode } from "@techbrief/shared";
import type { Locale, Strings } from "../i18n/types";
import { resolveArticleDisplayContent } from "./article-display";
import { formatRelativeTimestamp, getArticleTagLabels } from "./format";
import { getSourceColor } from "./source-colors";
import type { FeedArticle } from "../types/feed";

export function buildArticleDetailDocument(article: FeedArticle, locale: Locale, strings: Strings) {
  const [channelLabel, sourceLabel] = getArticleTagLabels(article, strings);
  const sourceAccent = getSourceColor(article.sourceName);
  const metadata = [
    article.author,
    formatRelativeTimestamp(article.publishedAt, locale)
  ].filter(Boolean) as string[];
  const translationStreamingActive = article.translationStreaming?.active === true;
  const streamingBodyDocument = article.translationStreaming?.bodyTiptapJson;
  const streamingBodyFallback = article.translationStreaming?.bodyNormalized;
  const displayContent = resolveArticleDisplayContent(article);
  const rawBodyDocument = translationStreamingActive
    ? streamingBodyDocument ?? (streamingBodyFallback ? undefined : displayContent.bodyTiptapJson)
    : streamingBodyDocument ?? displayContent.bodyTiptapJson;
  const bodyDocument = sanitizeDetailBodyDocument(rawBodyDocument, displayContent.title);
  const bodyFallback = translationStreamingActive
    ? streamingBodyFallback ?? displayContent.bodyNormalized ?? displayContent.summary ?? ""
    : streamingBodyFallback ?? displayContent.bodyNormalized ?? displayContent.summary ?? "";

  return buildDetailDocument({
    title: displayContent.title,
    metadata,
    metadataTags: [
      {
        label: channelLabel,
        tone: "primary",
        variant: "solid",
        size: "md",
        backgroundColor: "var(--tb-accent-soft)",
        textColor: "var(--tb-accent)",
        borderColor: "var(--tb-accent-soft)"
      },
      {
        label: sourceLabel,
        tone: "primary",
        variant: "solid",
        size: "md",
        backgroundColor: `${sourceAccent}1a`,
        textColor: sourceAccent,
        borderColor: `${sourceAccent}33`
      }
    ],
    bodyFallback,
    ...(displayContent.summary ? { summary: displayContent.summary } : {}),
    ...(bodyDocument ? { bodyDocument } : {})
  });
}

function sanitizeDetailBodyDocument(input: TiptapDocument | undefined, title: string): TiptapDocument | undefined {
  if (!input?.content?.length) {
    return input;
  }

  const content = input.content
    .map((node, index) => sanitizeDetailBodyNode(index === 0 ? removeLeadingTitleFromNode(node, title) : node))
    .filter((node) => !isEmptyParagraph(node));
  return { ...input, content };
}

function sanitizeDetailBodyNode(node: TiptapContentNode): TiptapContentNode {
  switch (node.type) {
    case "paragraph":
    case "heading":
      return {
        ...node,
        content: normalizeTextContent(node.content)
      } as TiptapContentNode;
    case "blockquote":
    case "listItem":
    case "taskItem":
    case "layoutColumn":
      return {
        ...node,
        content: node.content.map(sanitizeDetailBodyNode).filter((child) => !isEmptyParagraph(child))
      } as TiptapContentNode;
    case "bulletList":
    case "orderedList":
    case "taskList":
    case "layout":
    case "table":
    case "tableRow":
    case "tableCell":
    case "tableHeader":
      return {
        ...node,
        content: node.content.map(sanitizeDetailBodyNode).filter((child) => !isEmptyParagraph(child))
      } as TiptapContentNode;
    default:
      return node;
  }
}

function removeLeadingTitleFromNode(node: TiptapContentNode, title: string): TiptapContentNode {
  if (node.type !== "paragraph" || !node.content?.length) {
    return node;
  }

  const firstNode = node.content[0];
  if (!firstNode) {
    return node;
  }

  const firstText = firstNode.text;
  if (!firstText.startsWith(title)) {
    return node;
  }

  return {
    ...node,
    content: [
      { ...firstNode, text: firstText.slice(title.length) },
      ...node.content.slice(1)
    ]
  };
}

function normalizeTextContent(content: TiptapTextNode[] | undefined): TiptapTextNode[] | undefined {
  if (!content?.length) {
    return content;
  }

  const normalized = content
    .map((node) => ({ ...node, text: node.text.replace(/\s+/g, " ") }))
    .filter((node) => node.text.length > 0);

  const first = normalized[0];
  if (first) {
    first.text = first.text.trimStart();
  }
  const last = normalized[normalized.length - 1];
  if (last) {
    last.text = last.text.trimEnd();
  }

  return normalized.filter((node) => node.text.length > 0);
}

function isEmptyParagraph(node: TiptapContentNode): boolean {
  return node.type === "paragraph" && !node.content?.some((item) => item.text.trim().length > 0);
}
