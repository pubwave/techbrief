import { createTextSegment } from "../ast/builders.js";
import type { ContentInlineMark, ContentTextSegment } from "../ast/types.js";

const MARK_PATTERNS = [
  { type: "link" as const, pattern: /^\[([^\]]+)\]\(([^)]+)\)/ },
  { type: "code" as const, pattern: /^`([^`]+)`/ },
  { type: "bold" as const, pattern: /^\*\*([\s\S]+?)\*\*/ },
  { type: "underline" as const, pattern: /^\+\+([\s\S]+?)\+\+/ },
  { type: "strike" as const, pattern: /^~~([\s\S]+?)~~/ },
  { type: "italic" as const, pattern: /^\*([\s\S]+?)\*/ }
];

export function parseInlineMarkdownText(input: string): ContentTextSegment[] {
  const value = input.trim();
  if (!value) {
    return [];
  }

  const segments: ContentTextSegment[] = [];
  let remaining = value;

  while (remaining.length > 0) {
    const match = matchInlineToken(remaining);
    if (!match) {
      segments.push(createTextSegment(remaining));
      break;
    }

    if (match.index > 0) {
      segments.push(createTextSegment(remaining.slice(0, match.index)));
    }

    segments.push(...match.segments);
    remaining = remaining.slice(match.index + match.length);
  }

  return mergeAdjacentSegments(segments);
}

export function renderInlineMarkdownText(segments: ContentTextSegment[]): string {
  return segments
    .map((segment) => wrapWithMarks(segment.text, segment.marks ?? []))
    .join("")
    .trim();
}

export function htmlInlineToMarkdown(input: string): string {
  return input
    .replace(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __, href: string, text: string) => {
      return `[${htmlInlineToPlainText(text)}](${href.trim()})`;
    })
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_, __, text: string) => `**${htmlInlineToMarkdown(text)}**`)
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_, __, text: string) => `*${htmlInlineToMarkdown(text)}*`)
    .replace(/<u>([\s\S]*?)<\/u>/gi, (_, text: string) => `++${htmlInlineToMarkdown(text)}++`)
    .replace(/<(s|del|strike)>([\s\S]*?)<\/\1>/gi, (_, __, text: string) => `~~${htmlInlineToMarkdown(text)}~~`)
    .replace(/<code>([\s\S]*?)<\/code>/gi, (_, text: string) => `\`${htmlInlineToPlainText(text)}\``)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
}

export function htmlInlineToPlainText(input: string): string {
  return htmlInlineToMarkdown(input).replace(/\s+/g, " ").trim();
}

function matchInlineToken(input: string): { index: number; length: number; segments: ContentTextSegment[] } | null {
  for (let index = 0; index < input.length; index += 1) {
    const candidate = input.slice(index);

    for (const entry of MARK_PATTERNS) {
      const matched = candidate.match(entry.pattern);
      if (!matched) {
        continue;
      }

      if (entry.type === "link") {
        const text = matched[1]?.trim();
        const href = matched[2]?.trim();
        if (!text || !href) {
          continue;
        }

        return {
          index,
          length: matched[0].length,
          segments: addMark(parseInlineMarkdownText(text), { type: "link", attrs: { href } })
        };
      }

      const inner = matched[1] ?? "";
      if (!inner.trim()) {
        continue;
      }

      return {
        index,
        length: matched[0].length,
        segments: addMark(parseInlineMarkdownText(inner), { type: entry.type })
      };
    }
  }

  return null;
}

function addMark(segments: ContentTextSegment[], mark: ContentInlineMark): ContentTextSegment[] {
  return segments.map((segment) => ({
    text: segment.text,
    marks: [...(segment.marks ?? []), mark]
  }));
}

function mergeAdjacentSegments(segments: ContentTextSegment[]): ContentTextSegment[] {
  const merged: ContentTextSegment[] = [];

  for (const segment of segments) {
    if (!segment.text) {
      continue;
    }

    const previous = merged.at(-1);
    if (previous && sameMarks(previous.marks, segment.marks)) {
      previous.text += segment.text;
      continue;
    }

    merged.push(segment);
  }

  return merged;
}

function sameMarks(left?: ContentInlineMark[], right?: ContentInlineMark[]): boolean {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? []);
}

function wrapWithMarks(text: string, marks: ContentInlineMark[]): string {
  return marks.reduce((value, mark) => {
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
  }, text);
}
