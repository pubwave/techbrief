import type { Strings } from "../i18n/types";
import { useSyncStatus } from "../hooks/useSyncStatus";

function formatMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SyncStatusBar({
  strings,
  enabled = true,
  variant = "bar"
}: {
  strings: Strings;
  enabled?: boolean;
  // "bar": standalone row (its own padding). "compact": inline, for embedding
  // in the header next to the item count.
  variant?: "bar" | "compact";
}): React.ReactElement | null {
  const { ready, syncing, remainingSeconds } = useSyncStatus(enabled);

  if (!ready) {
    return null;
  }

  const wrapperClass = variant === "compact"
    ? "flex items-center justify-end gap-1.5 text-[10px] font-medium text-tb-text-muted"
    : "flex items-center gap-1.5 px-[18px] py-1.5 text-[11px] font-medium text-tb-text-muted";

  return (
    <div className={wrapperClass}>
      {syncing ? (
        <span className="flex items-center gap-1.5 text-tb-accent">
          <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-tb-accent" />
          <span className="animate-pulse">{strings.syncingData}</span>
        </span>
      ) : (
        <span>
          {strings.nextSyncLabel}
          <span className="ml-1 tabular-nums text-tb-text-secondary">{formatMmSs(remainingSeconds)}</span>
        </span>
      )}
    </div>
  );
}
