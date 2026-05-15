import type { Locale, Strings } from "../i18n/types";
import { ui } from "../lib/ui";
import type { ThemeId } from "../theme/themes";
import type { FeedArticle } from "../types/feed";
import { ArticleDetailContent } from "./ArticleDetailContent";

interface MobileArticleDetailPageProps {
  article: FeedArticle | null;
  locale: Locale;
  strings: Strings;
  theme: ThemeId;
  onBack: () => void;
  isTranslating?: boolean;
  translationError?: string | null;
}

export function MobileArticleDetailPage({
  article,
  locale,
  strings,
  theme,
  onBack,
  isTranslating = false,
  translationError = null
}: MobileArticleDetailPageProps) {
  return (
    <section className="px-[8px] py-[10px]">
      {article ? (
        <ArticleDetailContent
          article={article}
          locale={locale}
          strings={strings}
          theme={theme}
          topBar={
            <div className="flex flex-col gap-2">
              <button className={`${ui.button} self-start px-3 py-2`} onClick={onBack} type="button">
                {strings.backToList}
              </button>
              {translationError ? <div className={`${ui.subtlePanel} px-3 py-2.5 text-red-500`}>{translationError}</div> : null}
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <button className={`${ui.button} self-start px-3 py-2`} onClick={onBack} type="button">
            {strings.backToList}
          </button>
          <div>{strings.selectArticle}</div>
        </div>
      )}
    </section>
  );
}
