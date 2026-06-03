import { useAppRuntime } from "../app/app-runtime";
import techBriefAppIcon from "../assets/tech-brief-app-icon.svg";
import type { Strings } from "../i18n/types";
import { HomeIcon, SettingsIcon } from "./icons/ReaderIcons";

type AppView = "home" | "settings";

interface SideNavProps {
  value: AppView;
  onChange: (value: AppView) => void;
  strings: Strings;
}

const ITEM_DEFS: Array<{ id: AppView; Icon: typeof HomeIcon }> = [
  { id: "home", Icon: HomeIcon },
  { id: "settings", Icon: SettingsIcon }
];

export function SideNav({ value, onChange, strings }: SideNavProps) {
  const { isDesktop } = useAppRuntime();

  if (!isDesktop) {
    return <MobileNav onChange={onChange} strings={strings} value={value} />;
  }

  return (
    <aside
      aria-label={strings.menu}
      className="z-10 flex h-screen w-[60px] shrink-0 flex-col items-center border-r border-tb-border-subtle bg-tb-surface-nav pt-3 pb-4"
    >
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-[12px] border border-tb-border-strong bg-tb-surface-button p-[7px] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
        <img alt="" className="h-full w-full" src={techBriefAppIcon} />
      </div>

      <div className="flex w-full flex-1 flex-col gap-1 px-2">
        {ITEM_DEFS.map(({ id, Icon }) => {
          const active = value === id;
          const label = id === "home" ? strings.home : strings.settings;
          return (
            <button
              key={id}
              aria-current={active ? "page" : undefined}
              className={[
                "flex h-10 w-full cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[9px] border-none transition-colors duration-100",
                active
                  ? "bg-tb-surface-card-selected text-tb-accent"
                  : "bg-transparent text-tb-text-faint hover:bg-tb-surface-card-hover hover:text-tb-text-muted"
              ].join(" ")}
              onClick={() => onChange(id)}
              title={label}
              type="button"
            >
              <Icon size={16} />
              <span className="text-[9px] font-medium tracking-[0.02em]">{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function MobileNav({ value, onChange, strings }: SideNavProps) {
  const items: Array<{ id: AppView; label: string }> = [
    { id: "home", label: strings.home },
    { id: "settings", label: strings.settings }
  ];

  return (
    <aside className="flex items-center gap-2 rounded-[14px] border border-tb-border-subtle bg-tb-surface-shell p-2">
      {items.map((item) => (
        <button
          key={item.id}
          className={[
            "flex-1 cursor-pointer rounded-[10px] px-3 py-2 text-sm font-medium transition-colors",
            item.id === value
              ? "bg-tb-accent text-tb-accent-ink"
              : "bg-transparent text-tb-text-subtle hover:bg-tb-surface-card-hover hover:text-tb-text-primary"
          ].join(" ")}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export type { AppView };
