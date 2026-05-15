import { useEffect, useRef } from "react";
import { PubwaveEditor } from "@pubwave/editor";
import type { EditorAPI } from "@pubwave/editor";
import type { TiptapDocument } from "@techbrief/shared";
import type { Locale } from "../i18n/types";
import { createPubwaveTheme } from "../lib/pubwave-editor";
import type { ThemeId } from "../theme/themes";

interface ArticleDetailEditorProps {
  content: TiptapDocument;
  locale: Locale;
  theme: ThemeId;
}

export function ArticleDetailEditor({ content, locale, theme }: ArticleDetailEditorProps) {
  const editorRef = useRef<EditorAPI | null>(null);
  const contentRef = useRef<string>("");
  const nextContent = JSON.stringify(content);

  useEffect(() => {
    if (!editorRef.current || contentRef.current === nextContent) {
      return;
    }

    editorRef.current.setContent(content);
    contentRef.current = nextContent;
  }, [content, nextContent]);

  return (
    <div className="tb-article-editor">
      <PubwaveEditor
        ref={editorRef}
        content={content}
        editable={false}
        theme={createPubwaveTheme(theme, locale)}
        width="100%"
        onReady={() => {
          contentRef.current = nextContent;
        }}
      />
    </div>
  );
}
