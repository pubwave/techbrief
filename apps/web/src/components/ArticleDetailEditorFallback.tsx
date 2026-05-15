import type { Strings } from "../i18n/types";
import { LoadingBlock } from "./LoadingBlock";
import { LoadingNotice } from "./LoadingNotice";

interface ArticleDetailEditorFallbackProps {
  strings: Strings;
}

export function ArticleDetailEditorFallback({ strings }: ArticleDetailEditorFallbackProps) {
  return (
    <div className="flex flex-col gap-4">
      <LoadingBlock className="h-14 w-5/6" />
      <LoadingBlock className="h-4 w-full" />
      <LoadingBlock className="h-4 w-11/12" />
      <LoadingBlock className="h-4 w-10/12" />
      <LoadingBlock className="h-4 w-full" />
      <LoadingNotice strings={strings} />
    </div>
  );
}
