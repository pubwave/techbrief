import type { Strings } from "../i18n/types";
import type { ChannelFilter } from "../types/feed";
import { getChannelLabel } from "../lib/format";

interface ChannelTabsProps {
  value: ChannelFilter;
  onChange: (value: ChannelFilter) => void;
  strings: Strings;
}

const channels: ChannelFilter[] = ["all", "tech-news", "indie-dev"];

export function ChannelTabs({ value, onChange, strings }: ChannelTabsProps) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-tb-text-muted">
        {strings.channel}
      </span>
      {channels.map((channel) => (
        <button
          key={channel}
          className={
            channel === value
              ? "cursor-pointer rounded-lg border border-transparent bg-tb-accent px-[14px] py-2 text-[15px] font-medium text-tb-accent-ink"
              : "cursor-pointer rounded-lg border border-tb-border bg-tb-surface-nav px-[14px] py-2 text-[15px] font-medium text-tb-text-secondary"
          }
          onClick={() => onChange(channel)}
          type="button"
        >
          {getChannelLabel(channel, strings)}
        </button>
      ))}
    </div>
  );
}
