import { useEffect, useRef, useState } from "react";
import type { Strings } from "../i18n/types";
import { SettingsIcon } from "./icons/ReaderIcons";

export type CardStyle = "compact" | "comfortable" | "magazine";

export interface TweaksState {
  cardStyle: CardStyle;
  fontSize: number;
  listWidth: number;
}

export const DEFAULT_TWEAKS: TweaksState = {
  cardStyle: "compact",
  fontSize: 15,
  listWidth: 350
};

export const LIST_WIDTH_MIN = 300;
export const LIST_WIDTH_MAX = 520;
export const FONT_SIZE_MIN = 13;
export const FONT_SIZE_MAX = 20;

interface TweaksPanelProps {
  value: TweaksState;
  onChange: (next: TweaksState) => void;
  strings: Strings;
}

export function TweaksPanel({ value, onChange, strings }: TweaksPanelProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onDocClick(event: MouseEvent) {
      const wrapper = wrapperRef.current;
      if (!wrapper) {
        return;
      }
      if (!wrapper.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const cardStyles: Array<{ id: CardStyle; label: string }> = [
    { id: "compact", label: strings.cardStyleCompact },
    { id: "comfortable", label: strings.cardStyleComfortable },
    { id: "magazine", label: strings.cardStyleMagazine }
  ];

  return (
    <div
      className="pointer-events-none absolute right-6 bottom-6 z-30 flex flex-col items-end"
      ref={wrapperRef}
    >
      <div
        aria-hidden={!open}
        className={[
          "mb-2 w-[260px] rounded-[14px] border border-tb-border-strong bg-tb-surface-button p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-150",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        ].join(" ")}
      >
        <h4 className="mb-[14px] text-[12px] font-semibold uppercase tracking-[0.08em] text-tb-text-subtle">
          {strings.tweaksPanelTitle}
        </h4>

        <div className="mb-[14px]">
          <div className="mb-[6px] text-[11px] text-tb-text-muted">{strings.cardStyleLabel}</div>
          <div className="flex flex-wrap gap-[6px]">
            {cardStyles.map((item) => {
              const active = value.cardStyle === item.id;
              return (
                <button
                  key={item.id}
                  className={[
                    "cursor-pointer rounded-[6px] border px-[10px] py-[4px] text-[11px] transition-colors",
                    active
                      ? "border-tb-border-hover bg-tb-surface-card-selected text-tb-text-primary"
                      : "border-tb-border bg-tb-surface-input text-tb-text-subtle hover:border-tb-border-hover hover:bg-tb-surface-card-hover hover:text-tb-text-primary"
                  ].join(" ")}
                  onClick={() => onChange({ ...value, cardStyle: item.id })}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-[14px]">
          <div className="mb-[6px] text-[11px] text-tb-text-muted">
            {strings.readingFontSizeLabel}
          </div>
          <input
            aria-label={strings.readingFontSizeLabel}
            className="w-full"
            max={FONT_SIZE_MAX}
            min={FONT_SIZE_MIN}
            onChange={(event) =>
              onChange({ ...value, fontSize: Number(event.target.value) })
            }
            step={1}
            style={{ accentColor: "var(--tb-accent)" }}
            type="range"
            value={value.fontSize}
          />
        </div>

        <div>
          <div className="mb-[6px] text-[11px] text-tb-text-muted">{strings.listWidthLabel}</div>
          <input
            aria-label={strings.listWidthLabel}
            className="w-full"
            max={LIST_WIDTH_MAX}
            min={LIST_WIDTH_MIN}
            onChange={(event) =>
              onChange({ ...value, listWidth: Number(event.target.value) })
            }
            step={10}
            style={{ accentColor: "var(--tb-accent)" }}
            type="range"
            value={value.listWidth}
          />
        </div>
      </div>
      <button
        aria-expanded={open}
        aria-label={strings.readingPreferences}
        className={[
          "group pointer-events-auto relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border transition-colors duration-150",
          open
            ? "border-tb-accent bg-tb-surface-card-selected text-tb-accent"
            : "border-tb-border-strong bg-tb-surface-button text-tb-text-faint hover:border-tb-border-hover hover:text-tb-text-primary"
        ].join(" ")}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <SettingsIcon size={15} />
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-tb-border-strong bg-tb-surface-shell px-2 py-1 text-[11px] font-medium text-tb-text-primary opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-opacity duration-150 group-hover:opacity-100">
          {strings.readingPreferences}
        </span>
      </button>
    </div>
  );
}
