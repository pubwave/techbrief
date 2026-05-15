import { lazy, Suspense, type ReactNode } from "react";
import type { Locale, Strings } from "../i18n/types";
import { buildArticleDetailDocument } from "../lib/article-detail-document";
import type { ThemeId } from "../theme/themes";
import type { FeedArticle } from "../types/feed";
import { ArticleDetailEditorFallback } from "./ArticleDetailEditorFallback";

const LazyArticleDetailEditor = lazy(async () => {
  const module = await import("./ArticleDetailEditor");
  return { default: module.ArticleDetailEditor };
});

interface ArticleDetailContentProps {
  article: FeedArticle;
  locale: Locale;
  strings: Strings;
  theme: ThemeId;
  topBar?: ReactNode;
}

export function ArticleDetailContent({
  article,
  locale,
  strings,
  theme,
  topBar
}: ArticleDetailContentProps) {
  const document = buildArticleDetailDocument(article, locale, strings);

  return (
    <>
      {topBar ? <div className="mb-4">{topBar}</div> : null}
      <Suspense fallback={<ArticleDetailEditorFallback strings={strings} />}>
        <LazyArticleDetailEditor
          key={article.id}
          content={document}
          locale={locale}
          theme={theme}
        />
      </Suspense>
    </>
  );
}
