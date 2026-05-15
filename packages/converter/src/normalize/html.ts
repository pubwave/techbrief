import {
  createAstDocument,
  createBlockquoteNode,
  createCodeBlockNode,
  createEmbedNode,
  createHeadingNode,
  createHorizontalRuleNode,
  createImageNode,
  createListNode,
  createParagraphNode,
  createTableNode
} from "../ast/builders.js";
import type { ContentAstDocument } from "../ast/types.js";
import { normalizeWhitespace } from "./common.js";
import { parseMarkdownAst } from "../parse/markdown-ast.js";
import { htmlInlineToMarkdown, htmlInlineToPlainText, parseInlineMarkdownText } from "../parse/inline-text.js";
import type { SourceContentProfile } from "../profiles/source-profiles.js";
import { sanitizeHtml, stripHtmlTags } from "../sanitize.js";

const BLOCK_PATTERN =
  /<pre\b[^>]*>[\s\S]*?<\/pre>|<table\b[^>]*>[\s\S]*?<\/table>|<blockquote\b[^>]*>[\s\S]*?<\/blockquote>|<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>|<img\b[^>]*>|<iframe\b[^>]*>[\s\S]*?<\/iframe>|<hr\b[^>]*\/?>|<(p|div|section|article)\b[^>]*>[\s\S]*?<\/\2>/gi;
const ROW_PATTERN = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
const CELL_PATTERN = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const LIST_ITEM_PATTERN = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;

export function normalizeHtml(
  input: string,
  profile: SourceContentProfile
): { bodyNormalized: string; bodyAst: ContentAstDocument } {
  const sanitized = sanitizeHtml(input);
  const bodyNormalized = stripHtmlTags(sanitized);
  const richBlocks = extractHtmlBlocks(sanitized, profile);
  const plainTextRemainder = stripKnownBlocks(sanitized);
  const textAst = parseMarkdownAst(stripHtmlTags(plainTextRemainder));

  return {
    bodyNormalized,
    bodyAst: createAstDocument([...richBlocks, ...textAst.content])
  };
}

function extractHtmlBlocks(input: string, profile: SourceContentProfile): ContentAstDocument["content"] {
  const blocks: ContentAstDocument["content"] = [];

  for (const match of input.matchAll(BLOCK_PATTERN)) {
    const block = match[0];
    const normalized = mapHtmlBlock(block, profile);
    if (normalized.length > 0) {
      blocks.push(...normalized);
    }
  }

  return blocks;
}

function mapHtmlBlock(block: string, profile: SourceContentProfile): ContentAstDocument["content"] {
  const tag = detectTagName(block);
  if (!tag) {
    return [];
  }

  switch (tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return [createHeadingNode(Number.parseInt(tag.slice(1), 10), inlineContent(block))];
    case "blockquote":
      return [createBlockquoteNode(inlineContent(block))];
    case "pre":
      return [createCodeBlockNode(extractPreformattedText(block), extractCodeLanguage(block))];
    case "ul":
      return [createListNode("bulletList", extractListItems(block))];
    case "ol":
      return [createListNode("orderedList", extractListItems(block))];
    case "img":
      if (!profile.preserveImages) {
        return [];
      }
      return [createImageNode(
        extractAttribute(block, "src") ?? "",
        extractAttribute(block, "alt"),
        extractAttribute(block, "title")
      )].filter((node) => node.src);
    case "iframe":
      if (!profile.extractEmbeds) {
        return [];
      }
      return (() => {
        const src = extractAttribute(block, "src") ?? "";
        return src ? [createEmbedNode(src, inferEmbedProvider(src))] : [];
      })();
    case "table":
      if (!profile.extractTables) {
        return [];
      }
      return [createTableNode(extractTableRows(block))].filter((node) => node.rows.length > 0);
    case "hr":
      return [createHorizontalRuleNode()];
    case "p":
    case "div":
    case "section":
    case "article":
      return inlineContent(block).length > 0 ? [createParagraphNode(inlineContent(block))] : [];
    default:
      return [];
  }
}

function stripKnownBlocks(input: string): string {
  return input.replace(BLOCK_PATTERN, "\n\n");
}

function detectTagName(block: string): string | null {
  const matched = block.match(/^<([a-z0-9]+)/i);
  return matched?.[1]?.toLowerCase() ?? null;
}

function inlineContent(block: string) {
  const markdown = htmlInlineToMarkdown(removeOuterTag(block));
  return parseInlineMarkdownText(normalizeWhitespace(markdown));
}

function extractPreformattedText(block: string): string {
  const codeMatch = block.match(/<code\b[^>]*>([\s\S]*?)<\/code>/i);
  const inner = codeMatch?.[1] ?? removeOuterTag(block);
  return decodeHtmlEntities(inner)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractCodeLanguage(block: string): string | undefined {
  const className = block.match(/class=(["'])(.*?)\1/i)?.[2] ?? "";
  const language = className.match(/language-([a-z0-9-]+)/i)?.[1];
  return language?.trim() || undefined;
}

function extractListItems(block: string) {
  return Array.from(block.matchAll(LIST_ITEM_PATTERN))
    .map((match) => parseInlineMarkdownText(normalizeWhitespace(htmlInlineToMarkdown(match[1] ?? ""))))
    .filter((item) => item.length > 0);
}

function extractTableRows(block: string) {
  return Array.from(block.matchAll(ROW_PATTERN))
    .map((rowMatch) => {
      const row = rowMatch[1] ?? "";
      return Array.from(row.matchAll(CELL_PATTERN))
        .map((cellMatch) => parseInlineMarkdownText(normalizeWhitespace(htmlInlineToMarkdown(cellMatch[2] ?? ""))))
        .filter((cell) => cell.length > 0);
    })
    .filter((row) => row.length > 0);
}

function extractAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}=(["'])(.*?)\\1`, "i"));
  const value = match?.[2]?.trim();
  return value ? decodeHtmlEntities(value) : undefined;
}

function inferEmbedProvider(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube")) {
      return "youtube";
    }
    if (host.includes("vimeo")) {
      return "vimeo";
    }
    return host;
  } catch {
    return undefined;
  }
}

function removeOuterTag(value: string): string {
  return value.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>$/, "");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}
