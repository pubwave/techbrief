import type { Strings } from "../i18n/types";
import { ui } from "../lib/ui";

interface LoadingNoticeProps {
  strings: Strings;
}

export function LoadingNotice({ strings }: LoadingNoticeProps) {
  return (
    <div className={`${ui.subtlePanel} mt-3 flex items-center gap-3 px-3 py-2.5`}>
      <span className="tb-loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>{strings.loading}</span>
    </div>
  );
}
