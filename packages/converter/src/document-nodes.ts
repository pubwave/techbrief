import type {
  TiptapContentNode,
  TiptapDocument,
  TiptapParagraphNode,
  TiptapTextNode
} from "@techbrief/shared";

interface CreateTextOptions {
  href?: string;
  tag?: {
    tone?: "primary" | "neutral";
    variant?: "soft" | "outline" | "solid";
    size?: "sm" | "md";
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    spacing?: string;
  };
}

export function createDocument(content: TiptapContentNode[]): TiptapDocument {
  return {
    type: "doc",
    content
  };
}

export function createText(text: string, hrefOrOptions?: string | CreateTextOptions): TiptapTextNode {
  const options = resolveCreateTextOptions(hrefOrOptions);
  const marks: NonNullable<TiptapTextNode["marks"]> = [];

  if (options.href) {
    marks.push({ type: "link", attrs: { href: options.href } });
  }

  if (options.tag) {
    marks.push({
      type: "tag",
      attrs: {
        tone: options.tag.tone ?? "primary",
        variant: options.tag.variant ?? "soft",
        size: options.tag.size ?? "md",
        ...(options.tag.backgroundColor ? { backgroundColor: options.tag.backgroundColor } : {}),
        ...(options.tag.textColor ? { textColor: options.tag.textColor } : {}),
        ...(options.tag.borderColor ? { borderColor: options.tag.borderColor } : {}),
        ...(options.tag.spacing ? { spacing: options.tag.spacing } : {})
      }
    });
  }

  return marks.length > 0
    ? {
        type: "text",
        text,
        marks
      }
    : {
        type: "text",
        text
      };
}

export function createParagraphFromText(text: string): TiptapParagraphNode {
  return {
    type: "paragraph",
    content: [createText(text)]
  };
}

export function createParagraph(content: TiptapTextNode[]): TiptapParagraphNode {
  return {
    type: "paragraph",
    content
  };
}

function resolveCreateTextOptions(input: string | CreateTextOptions | undefined): CreateTextOptions {
  if (typeof input === "string") {
    return { href: input };
  }

  return input ?? {};
}
